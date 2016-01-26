#include "Profiler.h"
#include "Data/Clips.h"
#include "Data/Settings.h"
#include "Data/LinkableImpl.h"
#include "Data/Image/Controller.h"
#include "Data/Error/ErrorManager.h"
#include "Data/Util.h"
#include "Data/Plotter/Plot2DManager.h"
#include "Data/Plotter/PlotStyles.h"
#include "Plot2D/Plot2DGenerator.h"

#include "CartaLib/Hooks/Plot2DResult.h"
#include "CartaLib/AxisInfo.h"
#include "State/UtilState.h"
#include <QDebug>

namespace Carta {

namespace Data {

const QString Profiler::CLASS_NAME = "Profiler";
const QString Profiler::CLIP_BUFFER = "useClipBuffer";
const QString Profiler::CLIP_BUFFER_SIZE = "clipBuffer";
const QString Profiler::CLIP_MIN = "clipMin";
const QString Profiler::CLIP_MAX = "clipMax";
const QString Profiler::CLIP_MIN_CLIENT = "clipMinClient";
const QString Profiler::CLIP_MAX_CLIENT = "clipMaxClient";
const QString Profiler::CLIP_MIN_PERCENT = "clipMinPercent";
const QString Profiler::CLIP_MAX_PERCENT = "clipMaxPercent";


class Profiler::Factory : public Carta::State::CartaObjectFactory {
public:

    Carta::State::CartaObject * create (const QString & path, const QString & id)
    {
        return new Profiler (path, id);
    }
};

bool Profiler::m_registered =
        Carta::State::ObjectManager::objectManager()->registerClass ( CLASS_NAME, new Profiler::Factory());

using Carta::State::UtilState;
using Carta::State::StateInterface;
using Carta::Plot2D::Plot2DGenerator;

Profiler::Profiler( const QString& path, const QString& id):
            CartaObject( CLASS_NAME, path, id ),
            m_linkImpl( new LinkableImpl( path )),
            m_preferences( nullptr),
            m_plotManager( new Plot2DManager( path, id ) ),
            m_stateData( UtilState::getLookup(path, StateInterface::STATE_DATA)){

    Carta::State::ObjectManager* objMan = Carta::State::ObjectManager::objectManager();
    Settings* prefObj = objMan->createObject<Settings>();
    m_preferences.reset( prefObj );

    _initializeDefaultState();
    _initializeCallbacks();

    m_controllerLinked = false;
    m_plotManager->setPlotGenerator( new Plot2DGenerator( Plot2DGenerator::PlotType::PROFILE) );
    m_plotManager->setTitleAxisY( "" );
    m_plotManager->setTitleAxisX( "Channel" );
}



QString Profiler::addLink( CartaObject*  target){
    Controller* controller = dynamic_cast<Controller*>(target);
    bool linkAdded = false;
    QString result;
    if ( controller != nullptr ){
        if ( !m_controllerLinked ){
            linkAdded = m_linkImpl->addLink( controller );
            if ( linkAdded ){
                connect(controller, SIGNAL(dataChanged(Controller*)), this , SLOT(_createProfiler(Controller*)));
                connect(controller, SIGNAL(channelChanged(Controller*)), this, SLOT( _updateChannel(Controller*)));
                m_controllerLinked = true;
                _createProfiler( controller );
            }
        }
        else {
            CartaObject* obj = m_linkImpl->searchLinks( target->getPath());
            if ( obj != nullptr ){
                linkAdded = true;
            }
            else {
                result = "Profiler only supports linking to a single image source.";
            }
        }
    }
    else {
        result = "Profiler only supports linking to images";
    }
    return result;
}


void Profiler::_createProfiler( Controller* controller){
    std::shared_ptr<Carta::Lib::PixelPipeline::CustomizablePixelPipeline> pipeline = controller->getPipeline();
    m_plotManager->setPipeline( pipeline );

    //TODO: Update the data state.
    _generateProfile( true, controller );
}


std::vector<std::shared_ptr<Carta::Lib::Image::ImageInterface>> Profiler::_generateData(Controller* controller){
    std::vector<std::shared_ptr<Carta::Lib::Image::ImageInterface>> result;
    if ( controller != nullptr ){
        result = controller->getDataSources();
    }
    return result;
}


void Profiler::_generateProfile( bool newDataNeeded, Controller* controller ){
    Controller* activeController = controller;
    if ( activeController == nullptr ){
        activeController = _getControllerSelected();
    }
    if ( newDataNeeded ){
        _loadProfile( activeController );
    }
}


Controller* Profiler::_getControllerSelected() const {
    //We are only supporting one linked controller.
    Controller* controller = nullptr;
    int linkCount = m_linkImpl->getLinkCount();
    for ( int i = 0; i < linkCount; i++ ){
        CartaObject* obj = m_linkImpl->getLink(i );
        Controller* control = dynamic_cast<Controller*>( obj);
        if ( control != nullptr){
            controller = control;
            break;
        }
    }
    return controller;
}


QString Profiler::getStateString( const QString& sessionId, SnapshotType type ) const{
    QString result("");
    if ( type == SNAPSHOT_PREFERENCES ){
        StateInterface prefState( "");
        prefState.setValue<QString>(Carta::State::StateInterface::OBJECT_TYPE, CLASS_NAME );
        prefState.insertValue<QString>(Util::PREFERENCES, m_state.toString());
        prefState.insertValue<QString>( Settings::SETTINGS, m_preferences->getStateString(sessionId, type) );
        result = prefState.toString();
    }
    else if ( type == SNAPSHOT_LAYOUT ){
        result = m_linkImpl->getStateString(getIndex(), getSnapType( type ));
    }
    return result;
}



QList<QString> Profiler::getLinks() const {
    return m_linkImpl->getLinkIds();
}





QString Profiler::_getPreferencesId() const {
    return m_preferences->getPath();
}


void Profiler::_initializeDefaultState(){
    m_stateData.insertValue<double>( CLIP_MIN, 0 );
    m_stateData.insertValue<double>(CLIP_MAX, 1);
    //Difference between CLIP_MIN and CLIP_MIN_CLIENT is that CLIP_MIN
    //will never be less than the image minimum intensity.  The CLIP_MIN_CLIENT
    //will mostly mirror CLIP_MIN, but may be less than the image minimum intensity
    //if the user wants to zoom out for some reason.
    m_stateData.insertValue<double>( CLIP_MIN_CLIENT, 0 );
    m_stateData.insertValue<double>( CLIP_MAX_CLIENT, 1 );
    m_stateData.insertValue<int>(CLIP_BUFFER_SIZE, 10 );
    m_stateData.insertValue<double>(CLIP_MIN_PERCENT, 0);
    m_stateData.insertValue<double>(CLIP_MAX_PERCENT, 100);
    m_stateData.flushState();
}


void Profiler::_initializeCallbacks(){
    addCommandCallback( "registerPreferences", [=] (const QString & /*cmd*/,
            const QString & /*params*/, const QString & /*sessionId*/) -> QString {
        QString result = _getPreferencesId();
        return result;
    });

    addCommandCallback( "setClipBuffer", [=] (const QString & /*cmd*/,
            const QString & params, const QString & /*sessionId*/) -> QString {
        QString result;
        std::set<QString> keys = {CLIP_BUFFER_SIZE};
        std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
        QString clipBufferStr = dataValues[*keys.begin()];
        bool validInt = false;
        double clipBuffer = clipBufferStr.toInt( &validInt );
        if ( validInt ){
            result = setClipBuffer( clipBuffer );
        }
        else {
            result = "Invalid clip buffer size: " + params+" must be a valid integer.";
        }
        Util::commandPostProcess( result );
        return result;
    });

    addCommandCallback( "setClipMax", [=] (const QString & /*cmd*/,
            const QString & params, const QString & /*sessionId*/) -> QString {
        QString result;
        std::set<QString> keys = {CLIP_MAX};
        std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
        QString clipMaxStr = dataValues[CLIP_MAX];
        bool validRangeMax = false;
        double clipMax = clipMaxStr.toDouble( &validRangeMax );
        if ( validRangeMax ){
            result = setClipMax( clipMax );
        }
        else {
            result = "Invalid zoom maximum: " + params+" must be a valid number.";
        }
        Util::commandPostProcess( result );
        return result;
    });

    addCommandCallback( "setClipMaxPercent", [=] (const QString & /*cmd*/,
            const QString & params, const QString & /*sessionId*/) -> QString {
        QString result;

        std::set<QString> keys = {CLIP_MAX_PERCENT};
        std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
        QString clipMaxPercentStr = dataValues[CLIP_MAX_PERCENT];
        bool validRangeMax = false;
        double clipMaxPercent = clipMaxPercentStr.toDouble( &validRangeMax );
        if ( validRangeMax ){
            result = setClipMaxPercent( clipMaxPercent );
        }
        else {
            result = "Invalid zoom maximum percentile: " + params+", must be a valid number.";
        }
        Util::commandPostProcess( result );
        return result;
    });

    addCommandCallback( "setClipMin", [=] (const QString & /*cmd*/,
            const QString & params, const QString & /*sessionId*/) -> QString {
        QString result;
        std::set<QString> keys = {CLIP_MIN};
        std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
        QString clipMinStr = dataValues[CLIP_MIN];
        bool validRangeMin = false;
        double clipMin = clipMinStr.toDouble( &validRangeMin );
        if ( validRangeMin ){
            result = setClipMin( clipMin);
        }
        else {
            result = "Invalid zoom minimum: " + params+" must be a valid number.";
        }
        Util::commandPostProcess( result );
        return result;

    });

    addCommandCallback( "setClipMinPercent", [=] (const QString & /*cmd*/,
            const QString & params, const QString & /*sessionId*/) -> QString {
        QString result;
        std::set<QString> keys = {CLIP_MIN_PERCENT};
        std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
        QString clipMinPercentStr = dataValues[CLIP_MIN_PERCENT];
        bool validRangeMin = false;
        double clipMinPercent = clipMinPercentStr.toDouble( &validRangeMin );
        if ( validRangeMin ){
            result = setClipMinPercent( clipMinPercent);
        }
        else {
            result = "Invalid zoom minimum percentile: " + params+", must be a valid number.";
        }
        Util::commandPostProcess( result );
        return result;
    });

    addCommandCallback( "setUseClipBuffer", [=] (const QString & /*cmd*/,
            const QString & params, const QString & /*sessionId*/) -> QString {
        QString result;
        std::set<QString> keys = {CLIP_BUFFER};
        std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
        QString clipBufferStr = dataValues[*keys.begin()];
        bool validBool = false;
        bool useClipBuffer = Util::toBool(clipBufferStr, &validBool );
        if ( validBool ){
            result = setUseClipBuffer( useClipBuffer );
        }
        else {
            result = "Use clip buffer must be true/false: " + params;
        }
        Util::commandPostProcess( result );
        return result;
    });

    addCommandCallback( "zoomFull", [=] (const QString & /*cmd*/,
            const QString & /*params*/, const QString & /*sessionId*/) -> QString {
        QString result = setClipRangePercent( 0, 100);
        Util::commandPostProcess( result );
        return result;
    });

    addCommandCallback( "zoomRange", [=] (const QString & /*cmd*/,
            const QString & /*params*/, const QString & /*sessionId*/) -> QString {
        QString result = _zoomToSelection();
        Util::commandPostProcess( result );
        return result;
    });
}


void Profiler::_initializeStatics(){
}


bool Profiler::isLinked( const QString& linkId ) const {
    bool linked = false;
    CartaObject* obj = m_linkImpl->searchLinks( linkId );
    if ( obj != nullptr ){
        linked = true;
    }
    return linked;
}


void Profiler::_loadProfile( Controller* controller ){
    if( ! controller) {
        return;
    }
    std::vector<std::shared_ptr<Carta::Lib::Image::ImageInterface> > dataSources = controller-> getDataSources();
    if ( dataSources.size() > 0 ) {
    	std::vector < int > pos( dataSources[0]-> dims().size(), 0 );
        int axis = Util::getAxisIndex( dataSources[0], Carta::Lib::AxisInfo::KnownType::SPECTRAL );
        Profiles::PrincipalAxisProfilePath path( axis, pos );
        Carta::Lib::NdArray::RawViewInterface * rawView = dataSources[0]-> getDataSlice( SliceND() );
        Profiles::ProfileExtractor * extractor = new Profiles::ProfileExtractor( rawView );
        shared_ptr<Carta::Lib::Image::MetaDataInterface> metaData = dataSources[0]->metaData();
        QString fileName = metaData->title();
        QString pixelUnits = dataSources[0]->getPixelUnit().toStr();

        auto profilecb = [ = ] () {
            auto data = extractor->getDataD();
            int dataCount = data.size();
            std::vector<std::pair<double,double> > plotData( dataCount );
            for( int i = 0 ; i < dataCount; i ++ ){
                plotData[i].first = i;
                plotData[i].second = data[i];
            }

            Carta::Lib::Hooks::Plot2DResult plotResult( fileName, "", pixelUnits, plotData );

            m_plotManager->setData( plotResult );
            m_plotManager->setLogScale( false );
            m_plotManager->setStyle( PlotStyles::PLOT_STYLE_OUTLINE );
            m_plotManager->setColored( false );
            m_plotManager->updatePlot();
        };
        connect( extractor, & Profiles::ProfileExtractor::progress, profilecb );
        extractor-> start( path );
    }
}



QString Profiler::removeLink( CartaObject* cartaObject){
    bool removed = false;
    QString result;
    Controller* controller = dynamic_cast<Controller*>( cartaObject );
    if ( controller != nullptr ){
        removed = m_linkImpl->removeLink( controller );
        if ( removed ){
            controller->disconnect(this);
            m_controllerLinked = false;
            //_resetDefaultStateData();
        }
    }
    else {
       result = "Profiler was unable to remove link only image links are supported";
    }
    return result;
}

void Profiler::resetState( const QString& state ){
    StateInterface restoredState( "");
    restoredState.setState( state );

    QString settingStr = restoredState.getValue<QString>(Settings::SETTINGS);
    m_preferences->resetStateString( settingStr );

    QString prefStr = restoredState.getValue<QString>(Util::PREFERENCES);
    m_state.setState( prefStr );
    m_state.flushState();
}

QString Profiler::setClipBuffer( int bufferAmount ){
    QString result;
    if ( bufferAmount >= 0 && bufferAmount < 100 ){
        int oldBufferAmount = m_stateData.getValue<int>( CLIP_BUFFER_SIZE);
        if ( oldBufferAmount != bufferAmount ){
            m_stateData.setValue<int>( CLIP_BUFFER_SIZE, bufferAmount );
            m_stateData.flushState();
            _generateProfile( true );
        }
    }
    else {
        result = "Invalid buffer amount (0,100): "+QString::number(bufferAmount);
    }
    return result;
}
QString Profiler::setClipMax( double /*clipMaxClient*/){
    QString result;
    return result;
}

QString Profiler::setClipMin( double /*clipMinClient*/){
    QString result;
    return result;
}

QString Profiler::setClipMaxPercent( double /*clipMaxPercent*/){
    QString result;
    return result;
}

QString Profiler::setClipMinPercent( double /*clipMinPercent*/){
    QString result;
    return result;
}
QString Profiler::setClipRange( double /*clipMin*/, double /*clipMax*/ ){
    QString result;
    return result;
}

QString Profiler::setClipRangePercent( double /*clipMinPercent*/, double /*clipMaxPercent*/ ){
    QString result;
    return result;
}


QString Profiler::setGraphStyle( const QString& /*styleStr*/ ){
    QString result;
    /*QString oldStyle = m_state.getValue<QString>(GRAPH_STYLE);
    QString actualStyle = _getActualGraphStyle( styleStr );
    if ( actualStyle != "" ){
        if ( actualStyle != oldStyle ){
            m_state.setValue<QString>(GRAPH_STYLE, actualStyle );
            m_state.flushState();
            _generateProfile( false );
        }
    }
    else {
        result = "Unrecognized Profiler graph style: "+ styleStr;
    }*/
    return result;
}




QString Profiler::setUseClipBuffer( bool useBuffer ){
    QString result;
    bool oldUseBuffer = m_state.getValue<bool>(CLIP_BUFFER);
    if ( useBuffer != oldUseBuffer ){
        m_state.setValue<bool>(CLIP_BUFFER, useBuffer );
        m_state.flushState();
        _generateProfile( true );
    }
    return result;
}

void Profiler::_updateChannel( Controller* controller ){
    int frame = controller->getFrame( Carta::Lib::AxisInfo::KnownType::SPECTRAL );
    m_plotManager->setVLinePosition( frame );
}

QString Profiler::_zoomToSelection(){
    QString result;
    bool valid = false;
    std::pair<double,double> range = m_plotManager->getRange( & valid );
    if ( valid ){
        double minRange = range.first;
        double maxRange = range.second;
        if ( range.first > range.second ){
            minRange = range.second;
            maxRange = range.first;
        }
        if ( minRange < maxRange ){
            result = setClipRange( minRange, maxRange );
        }
    }
    else {
        _generateProfile( valid );
    }
    return result;
}



Profiler::~Profiler(){
}
}
}