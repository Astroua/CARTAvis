#include "Data/ViewManager.h"
#include "Data/Animator/Animator.h"
#include "Data/Animator/AnimationTypes.h"
#include "Data/Clips.h"
#include "Data/Colormap/Colormap.h"
#include "Data/Colormap/Colormaps.h"
#include "Data/Image/Controller.h"
#include "Data/Image/CoordinateSystems.h"
#include "Data/ChannelUnits.h"
#include "Data/DataLoader.h"
#include "Data/Colormap/TransformsData.h"
#include "Data/Colormap/TransformsImage.h"
#include "Data/Error/ErrorManager.h"
#include "Data/Histogram/Histogram.h"
#include "Data/ILinkable.h"
#include "Data/Layout/Layout.h"
#include "Data/Layout/NodeFactory.h"
#include "Data/Preferences.h"
#include "Data/Snapshot/Snapshots.h"
#include "Data/Statistics.h"
#include "Data/ViewPlugins.h"
#include "Data/Util.h"
#include "State/UtilState.h"

#include <QDir>
#include <QDebug>

namespace Carta {

namespace Data {

class ViewManager::Factory : public Carta::State::CartaObjectFactory {

public:
    Factory():
        CartaObjectFactory( "ViewManager" ){};
    Carta::State::CartaObject * create (const QString & path, const QString & id)
    {
        return new ViewManager (path, id);
    }
};

const QString ViewManager::CLASS_NAME = "ViewManager";
const QString ViewManager::SOURCE_ID = "sourceId";
const QString ViewManager::SOURCE_PLUGIN = "sourcePlugin";
const QString ViewManager::SOURCE_LOCATION_ID = "sourceLocateId";
const QString ViewManager::DEST_ID = "destId";
const QString ViewManager::DEST_PLUGIN = "destPlugin";
const QString ViewManager::DEST_LOCATION_ID = "destLocateId";

bool ViewManager::m_registered =
        Carta::State::ObjectManager::objectManager()->registerClass ( CLASS_NAME,
                                                   new ViewManager::Factory());

ViewManager::ViewManager( const QString& path, const QString& id)
    : CartaObject( CLASS_NAME, path, id ),
      m_layout( nullptr ),
      m_dataLoader( nullptr ),
      m_pluginsLoaded( nullptr ),
      m_snapshots( nullptr ){

    Carta::State::ObjectManager* objMan = Carta::State::ObjectManager::objectManager();
    objMan->printObjects();
    Util::findSingletonObject( AnimationTypes::CLASS_NAME );
    Util::findSingletonObject( Clips::CLASS_NAME );
    Util::findSingletonObject( Colormaps::CLASS_NAME );
    Util::findSingletonObject( TransformsData::CLASS_NAME);
    Util::findSingletonObject( TransformsImage::CLASS_NAME);
    Util::findSingletonObject( ErrorManager::CLASS_NAME );
    Util::findSingletonObject( Preferences::CLASS_NAME );
    Util::findSingletonObject( ChannelUnits::CLASS_NAME );
    Util::findSingletonObject( CoordinateSystems::CLASS_NAME );
    _initCallbacks();
    _initializeDefaultState();
    _makeDataLoader();
}

int ViewManager::_removeViews( const QString& name, int startIndex, int endIndex ){
    int upperBound = endIndex + 1;
    int existingCount = 0;
    if ( name == Colormap::CLASS_NAME ){
        existingCount = m_colormaps.size();
        if ( endIndex < 0 ){
            upperBound = existingCount;
        }
        _clearColormaps(startIndex, upperBound );
    }
    else if ( name == Histogram::CLASS_NAME ){
        existingCount = m_histograms.size();
        if ( endIndex < 0 ){
            upperBound = existingCount;
        }
        _clearHistograms(startIndex, upperBound);
    }
    else if ( name == Animator::CLASS_NAME ){
        existingCount = m_animators.size();
        if ( endIndex < 0 ){
            upperBound = existingCount;
        }
        _clearAnimators(startIndex, upperBound);
    }
    else if ( name == Controller::PLUGIN_NAME ){
        existingCount = m_controllers.size();
        if ( endIndex < 0 ){
            upperBound = existingCount;
        }
        _clearControllers(startIndex, upperBound);
    }
    else if ( name == Statistics::CLASS_NAME ){
        existingCount = m_statistics.size();
        if ( endIndex < 0 ){
            upperBound = existingCount;
        }
        _clearStatistics(startIndex, upperBound);
    }
    return existingCount;
}

void ViewManager::_adjustSize( int count, const QString& name, const QVector<int> & insertionIndices ){
    int existingCount = 0;
    if ( name == NodeFactory::HIDDEN ){
        return;
    }
    else {
        existingCount = _removeViews( name, count, -1 );
    }

    //Add some at the inserting indices.
    if ( existingCount < count ){
        int index = 0;
        for ( int i = existingCount; i < count; i++ ){
            this->getObjectId( name, insertionIndices[index], true );
            index++;
        }
    }
}

void ViewManager::_clear(){
    _clearHistograms( 0, m_controllers.size() );
    _clearStatistics( 0, m_statistics.size() );
    _clearAnimators( 0, m_animators.size() );
    _clearColormaps( 0, m_colormaps.size() );
    _clearControllers( 0, m_controllers.size() );
    if ( m_layout != nullptr ){
        m_layout->clear();
    }
}

void ViewManager::_clearControllers( int startIndex, int upperBound ){
    Carta::State::ObjectManager* objMan = Carta::State::ObjectManager::objectManager();
    for ( int i = upperBound-1; i >= startIndex; i-- ){
        for ( Animator* anim : m_animators ){
            anim->removeLink( m_controllers[i]);
        }
        for ( Histogram* hist : m_histograms ){
            hist->removeLink( m_controllers[i]);
        }
        for ( Colormap* map : m_colormaps ){
            map->removeLink( m_controllers[i]);
        }
        for ( Statistics* stat : m_statistics ){
            stat->removeLink( m_controllers[i]);
        }
        objMan->destroyObject( m_controllers[i]->getId() );
        m_controllers.pop_back();
    }
}

void ViewManager::_clearAnimators( int startIndex, int upperBound ){
    Carta::State::ObjectManager* objMan = Carta::State::ObjectManager::objectManager();
    for ( int i = upperBound-1; i >= startIndex; i-- ){
        objMan->destroyObject( m_animators[i]->getId() );
        m_animators.pop_back();
    }
}

void ViewManager::_clearColormaps( int startIndex, int upperBound ){
    Carta::State::ObjectManager* objMan = Carta::State::ObjectManager::objectManager();
    for ( int i = upperBound-1; i >= startIndex; i-- ){
        for (Histogram* hist : m_histograms ){
            hist->removeLink( m_colormaps[i]);
        }
        objMan->destroyObject( m_colormaps[i]->getId() );
        m_colormaps.pop_back();
    }
}

void ViewManager::_clearHistograms( int startIndex, int upperBound ){
    Carta::State::ObjectManager* objMan = Carta::State::ObjectManager::objectManager();
    for ( int i = upperBound-1; i >= startIndex; i-- ){
        objMan->destroyObject( m_histograms[i]->getId() );
        m_histograms.pop_back();
    }
}

void ViewManager::_clearStatistics( int startIndex, int upperBound ){
    Carta::State::ObjectManager* objMan = Carta::State::ObjectManager::objectManager();
    for ( int i = upperBound-1; i >= startIndex; i-- ){
        objMan->destroyObject( m_statistics[i] ->getId() );
        m_statistics.pop_back();
    }
}

int ViewManager::_findListIndex( const QString& sourcePlugin, int pluginIndex, const QStringList& plugins ) const{
    int pluginCount = -1;
    int listIndex = -1;
    for ( int i = 0; i < plugins.size(); i++ ){
        if ( plugins[i] == sourcePlugin ){
            pluginCount++;
        }
        if ( pluginCount == pluginIndex ){
            listIndex = i;
            break;
        }
    }
    return listIndex;
}

QString ViewManager::getObjectId( const QString& plugin, int index, bool forceCreate ){
    QString viewId("");
    if ( plugin == Controller::PLUGIN_NAME ){
        if ( 0 <= index && index < m_controllers.size()&&!forceCreate){
            viewId = m_controllers[index]->getPath();
        }
        else {
            if ( index == -1 ){
                index = m_controllers.size();
            }
            viewId = _makeController(index);
        }
    }
    else if ( plugin == Animator::CLASS_NAME ){
        if ( 0 <= index && index < m_animators.size() && !forceCreate ){
            viewId = m_animators[index]->getPath();
        }
        else {
            if ( index == -1 ){
                index = m_animators.size();
            }
            viewId = _makeAnimator(index);
        }
    }
    else if ( plugin == Colormap::CLASS_NAME ){
        if ( 0 <= index && index < m_colormaps.size() && !forceCreate){
            viewId = m_colormaps[index]->getPath();
        }
        else {
            if ( index == -1 ){
                index = m_colormaps.size();
            }
            viewId = _makeColorMap( index );
        }
    }
    else if ( plugin == Histogram::CLASS_NAME ){
        if ( 0 <= index && index < m_histograms.size() && !forceCreate){
            viewId = m_histograms[index]->getPath();
        }
        else {
            if ( index == -1 ){
                index = m_histograms.size();
            }
            viewId = _makeHistogram(index);
        }
    }
    else if ( plugin == Snapshots::CLASS_NAME ){
        viewId = _makeSnapshots();
    }
    else if ( plugin == Statistics::CLASS_NAME ){
        if ( 0 <= index && index < m_statistics.size() && !forceCreate ){
            viewId = m_statistics[index]->getPath();
        }
        else {
            if ( index == -1 ){
                index = m_statistics.size();
            }
            viewId = _makeStatistics(index);
        }
    }
    else if ( plugin == ViewPlugins::CLASS_NAME ){
        viewId = _makePluginList();
    }
    else if ( plugin == NodeFactory::EMPTY || plugin == NodeFactory::HIDDEN ){
        //Do nothing
    }
    else {
        qDebug() << "Unrecognized top level window type: "<<plugin;
    }
    return viewId;
}

int ViewManager::getControllerCount() const {
    int controllerCount = m_controllers.size();
    return controllerCount;
}

int ViewManager::getColormapCount() const {
    int colorMapCount = m_colormaps.size();
    return colorMapCount;
}

int ViewManager::getAnimatorCount() const {
    int animatorCount = m_animators.size();
    return animatorCount;
}

int ViewManager::getHistogramCount() const {
    int histogramCount = m_histograms.size();
    return histogramCount;
}

int ViewManager::getStatisticsCount() const {
    int statisticsCount = m_statistics.size();
    return statisticsCount;
}

void ViewManager::_initCallbacks(){
    addCommandCallback( "clearLayout", [=] (const QString & /*cmd*/,
                const QString & /*params*/, const QString & /*sessionId*/) -> QString {
        _clear();
        return "";
    });

    //Callback for registering a view.
    addCommandCallback( "registerSnapshots", [=] (const QString & /*cmd*/,
            const QString & /*params*/, const QString & sessionId) -> QString {
        QString viewId = _makeSnapshots();
        //Lazy load of snapshots when user requests them.
        m_snapshots->updateSnapshots( sessionId );
        return viewId;
    });

    addCommandCallback( "setAnalysisLayout", [=] (const QString & /*cmd*/,
                    const QString & /*params*/, const QString & /*sessionId*/) -> QString {
            setAnalysisView();
            return "";
        });

    addCommandCallback( "setImageLayout", [=] (const QString & /*cmd*/,
                        const QString & /*params*/, const QString & /*sessionId*/) -> QString {
            setImageView();
            return "";
        });

    //Callback for adding a data source to a Controller.
    addCommandCallback( "dataLoaded", [=] (const QString & /*cmd*/,
            const QString & params, const QString & /*sessionId*/) -> QString {
        const QString ID( "id");
        const QString DATA( "data");
        std::set<QString> keys = {ID,DATA};
        std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
        loadFile( dataValues[ID], dataValues[DATA]);
        return "";
    });

    //Callback for registering a view.
    addCommandCallback( "registerView", [=] (const QString & /*cmd*/,
            const QString & params, const QString & /*sessionId*/) -> QString {
        const QString PLUGIN_ID( "pluginId");
        const QString INDEX( "index");
        std::set<QString> keys = {PLUGIN_ID, INDEX};
        std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
        bool validIndex = false;
        int index = dataValues[INDEX].toInt(&validIndex);
        QString viewId( "");
        if ( validIndex ){
            viewId = getObjectId( dataValues[PLUGIN_ID], index );
        }
        else {
            qWarning()<< "Register view: invalid index: "+dataValues[PLUGIN_ID];
        }
        return viewId;
    });

    //Callback for linking an animator with whatever it is going to animate.
    addCommandCallback( "linkAdd", [=] (const QString & /*cmd*/,
            const QString & params, const QString & /*sessionId*/) -> QString {
        std::set<QString> keys = {SOURCE_ID, DEST_ID};
        std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
        QString result = linkAdd( dataValues[SOURCE_ID], dataValues[DEST_ID]);
        Util::commandPostProcess( result);
        return result;
    });

    //Callback for linking an animator with whatever it is going to animate.
    addCommandCallback( "linkRemove", [=] (const QString & /*cmd*/,
            const QString & params, const QString & /*sessionId*/) -> QString {
        std::set<QString> keys = {SOURCE_ID, DEST_ID};
        std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
        QString result = linkRemove( dataValues[SOURCE_ID], dataValues[DEST_ID]);
        Util::commandPostProcess( result );
        return result;
    });


    //Callback for updating links after all objects have been created.
    addCommandCallback( "refreshState", [=] (const QString & /*cmd*/,
                    const QString & /*params*/, const QString & /*sessionId*/) -> QString {
                _refreshState();
                return "";
            });

    addCommandCallback( "setPlugin", [=] (const QString & /*cmd*/,
                            const QString & params, const QString & /*sessionId*/) -> QString {
            std::set<QString> keys = { DEST_PLUGIN, SOURCE_LOCATION_ID };
            std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
            QString result = _setPlugin( dataValues[SOURCE_LOCATION_ID], dataValues[DEST_PLUGIN]);
            Util::commandPostProcess( result );
            return result;
        });

    addCommandCallback( "moveWindow", [=] (const QString & /*cmd*/,
                                const QString & params, const QString & /*sessionId*/) -> QString {
        std::set<QString> keys = {SOURCE_PLUGIN, SOURCE_LOCATION_ID, DEST_PLUGIN, DEST_LOCATION_ID};
        std::map<QString,QString> dataValues = Carta::State::UtilState::parseParamMap( params, keys );
        int sourceIndex = m_layout->_getIndex( dataValues[SOURCE_PLUGIN], dataValues[SOURCE_LOCATION_ID]);
        int destIndex = m_layout->_getIndex( dataValues[DEST_PLUGIN], dataValues[DEST_LOCATION_ID]);
        QString result = moveWindow( dataValues[SOURCE_PLUGIN], sourceIndex, dataValues[DEST_PLUGIN], destIndex );
        Util::commandPostProcess( result );
        return result;
    });

    addStateCallback( Layout::CLASS_NAME, [=] ( const QString& /*path*/, const QString& /*value*/ ) {
        _makeLayout();
        QStringList pluginList = m_layout->getPluginList();
        this->setPlugins( pluginList );
    });

}


void ViewManager::_initializeDefaultState(){
    setAnalysisView();
    //Load the default snapshot if one exists.
    _makeSnapshots();
    m_snapshots->initializeDefaultState();
}


QString ViewManager::linkAdd( const QString& sourceId, const QString& destId ){
    QString result;
    Carta::State::ObjectManager* objManager = Carta::State::ObjectManager::objectManager();
    QString dId = objManager->parseId( destId );
    Carta::State::CartaObject* destObj = objManager->getObject( dId );
    if ( destObj != nullptr ){
        QString id = objManager->parseId( sourceId );
        Carta::State::CartaObject* sourceObj = objManager->getObject( id );
        ILinkable* linkSource = dynamic_cast<ILinkable*>( sourceObj );
        if ( linkSource != nullptr ){
            result = linkSource->addLink( destObj );
        }
        else {
            result = "Unrecognized add link source: "+sourceId;
        }
    }
    else {
        result = "Unrecognized add link destination: "+dId;
    }
    return result;
}

QString ViewManager::linkRemove( const QString& sourceId, const QString& destId ){
    QString result;
    Carta::State::ObjectManager* objManager = Carta::State::ObjectManager::objectManager();
    QString dId = objManager->parseId( destId );
    Carta::State::CartaObject* destObj = objManager->getObject( dId );
    if ( destObj != nullptr ){
        QString id = objManager->parseId( sourceId );
        Carta::State::CartaObject* sourceObj = objManager->getObject( id );
        ILinkable* linkSource = dynamic_cast<ILinkable*>( sourceObj );
        if ( linkSource != nullptr ){
            result = linkSource->removeLink( destObj );
        }
        else {
            result = "Could not remove link, unrecognized source: "+sourceId;
        }
    }
    else {
        result = "Could not remove link, unrecognized destination: "+destId;
    }
    return result;
}

bool ViewManager::loadFile( const QString& controlId, const QString& fileName){
    bool result = false;
    int controlCount = getControllerCount();
    for ( int i = 0; i < controlCount; i++ ){
        const QString controlPath= m_controllers[i]->getPath();
        if ( controlId  == controlPath ){
           //Add the data to it
            _makeDataLoader();
           QString path = m_dataLoader->getFile( fileName, "" );
           m_controllers[i]->addData( path );
           result = true;
           break;
        }
    }
    return result;
}

bool ViewManager::loadLocalFile( const QString& controlId, const QString& fileName){
    bool result = false;
    int controlCount = getControllerCount();
    for ( int i = 0; i < controlCount; i++ ){
        const QString controlPath= m_controllers[i]->getPath();
        if ( controlId  == controlPath ){
           //Add the data to it
            _makeDataLoader();
           result = m_controllers[i]->addData( fileName );
           break;
        }
    }
    return result;
}




void ViewManager::_moveView( const QString& plugin, int oldIndex, int newIndex ){
    if ( oldIndex != newIndex && oldIndex >= 0 && newIndex >= 0 ){
        if ( plugin == Controller::PLUGIN_NAME ){
            int controlCount = m_controllers.size();
            if ( oldIndex < controlCount && newIndex < controlCount ){
                Controller* controller = m_controllers[oldIndex];
                m_controllers.removeAt(oldIndex );
                m_controllers.insert( newIndex, controller );
            }
        }
        else if ( plugin == Animator::CLASS_NAME ){
            int animCount = m_animators.size();
            if ( oldIndex < animCount && newIndex < animCount ){
                Animator* animator = m_animators[oldIndex];
                m_animators.removeAt(oldIndex );
                m_animators.insert( newIndex, animator );
            }
        }
        else if ( plugin == Colormap::CLASS_NAME ){
            int colorCount = m_colormaps.size();
            if ( oldIndex < colorCount && newIndex < colorCount ){
                Colormap* colormap = m_colormaps[oldIndex];
                m_colormaps.removeAt(oldIndex );
                m_colormaps.insert( newIndex, colormap );
            }
        }
        else if ( plugin == Histogram::CLASS_NAME ){
            int histCount = m_histograms.size();
            if ( oldIndex < histCount && newIndex < histCount ){
                Histogram* histogram = m_histograms[oldIndex];
                m_histograms.removeAt(oldIndex );
                m_histograms.insert( newIndex, histogram );
            }
        }
        else if ( plugin == Statistics::CLASS_NAME ){
            int statCount = m_statistics.size();
            if ( oldIndex < statCount && newIndex < statCount ){
                Statistics* statistics = m_statistics[oldIndex];
                m_statistics.removeAt(oldIndex );
                m_statistics.insert( newIndex, statistics );
            }
        }
        else {
            qWarning() << "Unrecognized plugin "<<plugin<<" to remove";
        }
    }
    else {
        qWarning() << "Move view insert indices don't make sense "<<oldIndex<<" and "<<newIndex;
    }
}


QString ViewManager::_makeAnimator( int index ){
    int currentCount = m_animators.size();
    CARTA_ASSERT( 0 <= index && index <= currentCount );
    Carta::State::CartaObject* animObj = Util::createObject( Animator::CLASS_NAME );
    m_animators.insert( index, dynamic_cast<Animator*>(animObj));
    for ( int i = index; i < currentCount + 1; i++ ){
        m_animators[i]->setIndex( i );
    }
    QString path = m_animators[index] ->getPath();
    return path;
}

QString ViewManager::_makeColorMap( int index ){
    int currentCount = m_colormaps.size();
    CARTA_ASSERT( 0 <= index && index <= currentCount );
    Carta::State::CartaObject* controlObj = Util::createObject( Colormap::CLASS_NAME );
    m_colormaps.insert( index, dynamic_cast<Colormap*>(controlObj) );
    for ( int i = index; i < currentCount + 1; i++ ){
        m_colormaps[i]->setIndex( i );
    }
    QString path = m_colormaps[index]->getPath();
   return path;
}

QString ViewManager::_makeController( int index ){
    int currentCount = m_controllers.size();
    CARTA_ASSERT( 0 <= index && index <= currentCount );
    Carta::State::CartaObject* controlObj = Util::createObject( Controller::CLASS_NAME );
    m_controllers.insert( index, dynamic_cast<Controller*>(controlObj) );
    for ( int i = index; i < currentCount + 1; i++ ){
        m_controllers[i]->setIndex( i );
    }
    QString path = m_controllers[index]->getPath();
    return path;
}

void ViewManager::_makeDataLoader(){
    if ( m_dataLoader == nullptr ){
        Carta::State::CartaObject* dataLoaderObj = Util::createObject( DataLoader::CLASS_NAME );
        m_dataLoader =dynamic_cast<DataLoader*>( dataLoaderObj );
    }
}

QString ViewManager::_makeHistogram( int index ){
    int currentCount = m_histograms.size();
    CARTA_ASSERT( 0 <= index && index <= currentCount );
    Carta::State::CartaObject* controlObj = Util::createObject( Histogram::CLASS_NAME );
    m_histograms.insert( index, dynamic_cast<Histogram*>(controlObj) );
    for ( int i = index; i < currentCount + 1; i++ ){
        m_histograms[i]->setIndex( i );
    }
    return m_histograms[index]->getPath();
}

QString ViewManager::_makeLayout(){
    if ( !m_layout ){
        Carta::State::CartaObject* layoutObj = Util::createObject( Layout::CLASS_NAME );
        m_layout = dynamic_cast<Layout*>(layoutObj );
        connect( m_layout, SIGNAL(pluginListChanged(const QStringList&, const QStringList&)),
                this, SLOT( _pluginsChanged( const QStringList&, const QStringList&)));
    }
    QString layoutPath = m_layout->getPath();
    return layoutPath;
}

QString ViewManager::_makePluginList(){
    if ( !m_pluginsLoaded ){
        //Initialize a view showing the plugins that have been loaded
        Carta::State::CartaObject* pluginsObj = Util::createObject( ViewPlugins::CLASS_NAME );
        m_pluginsLoaded = dynamic_cast<ViewPlugins*>(pluginsObj);
    }
    QString pluginsPath = m_pluginsLoaded->getPath();
    return pluginsPath;
}

QString ViewManager::_makeSnapshots(){
    if ( !m_snapshots ){
        Carta::State::CartaObject* snapObj = Util::createObject( Snapshots::CLASS_NAME );
        m_snapshots = dynamic_cast<Snapshots*>(snapObj );
    }
    QString snapPath = m_snapshots->getPath();
    return snapPath;
}

QString ViewManager::_makeStatistics( int index ){
    int currentCount = m_statistics.size();
    CARTA_ASSERT( 0 <= index && index <= currentCount );
    Carta::State::CartaObject* controlObj = Util::createObject( Statistics::CLASS_NAME );
    m_statistics.insert( index, dynamic_cast<Statistics*>(controlObj) );
    for ( int i = index; i < currentCount + 1; i++ ){
        m_statistics[i]->setIndex( i );
    }
    return m_statistics[index]->getPath();
}

QString ViewManager::moveWindow( const QString& sourcePlugin, int sourcePluginIndex,
        const QString& destPlugin, int destPluginIndex ){

    //Remove the view object at the current destination.
    QString msg;
    QStringList oldPlugins = m_layout->getPluginList();
    _removeView( destPlugin, destPluginIndex );

    //Look through the list of plugins.  Make a new list of plugins, replacing the one at destination Index,
    //with the source one.
    //Replace where the source used to be with EMPTY.
    int newSourcePluginIndex = -1;
    int destPluginCount = -1;
    int sourcePluginCount = -1;
    QStringList newPlugins;
    for ( int i = 0; i < oldPlugins.size(); i++ ){
        if ( oldPlugins[i] == sourcePlugin ){
            if ( i <= destPluginIndex ){

                newSourcePluginIndex++;
            }
            sourcePluginCount++;
        }
        if ( oldPlugins[i]  == destPlugin ){
            destPluginCount++;
        }
        if ( oldPlugins[i] == sourcePlugin && sourcePluginCount == sourcePluginIndex ){
            newPlugins.append( NodeFactory::EMPTY );
        }
        else if ( oldPlugins[i] == destPlugin && destPluginCount == destPluginIndex ){
            newPlugins.append( sourcePlugin );
        }
        else {
            newPlugins.append( oldPlugins[i]);
        }
    }

    //if the new location of the source, changes it's index.  If
    //it does, reorder the view objects putting the source at the new index.
    if ( newSourcePluginIndex != sourcePluginIndex && newSourcePluginIndex >= 0){
        _moveView( sourcePlugin, sourcePluginIndex, newSourcePluginIndex );
    }

    //Call setPlugins with the new list.  The should update the view objects removing the old destPlugin view.
    msg = m_layout->setPlugins( newPlugins, true );
    return msg;
}


void ViewManager::_pluginsChanged( const QStringList& names, const QStringList& oldNames ){
    QMap<QString, int> pluginMap;
    QMap<QString, QVector<int>> insertionIndices;
    int oldNameCount = oldNames.size();
    for ( int i = 0; i < names.size(); i++ ){
        if ( !insertionIndices.contains( names[i]) ){
            insertionIndices[names[i]] = QVector<int>();
        }
        //Store the accumulated count for this plugin.
        if ( pluginMap.contains( names[i]) ){
            pluginMap[names[i]] = pluginMap[names[i]]+1;
        }
        else {
            pluginMap[names[i]] = 1;
        }

        //If there is an existing plugin of this type at i,
        //then we don't need to do an insertion, otherwise, we may need to
        //if the new plugin count ends up being more than the old one.
        if ( i >= oldNameCount || oldNames[i] != names[i] ){
            QVector<int> & indices = insertionIndices[names[i]];
            indices.append( pluginMap[names[i]] - 1);
        }
    }

    //Add counts of zero for old ones that no longer exist.
    for ( int i = 0; i < oldNameCount; i++ ){
        if ( !names.contains( oldNames[i] ) ){
            pluginMap[oldNames[i]] = 0;
            insertionIndices[oldNames[i]] = QVector<int>(0);
        }
    }

    //Remove any views that are no longer needed
    QList<QString> keys = pluginMap.keys();
    for ( QString key : keys ){
        _adjustSize( pluginMap[key], key, insertionIndices[key]);
    }

}

void ViewManager::_refreshStateSingletons(){
    CartaObject* obj = Util::findSingletonObject( AnimationTypes::CLASS_NAME );
    obj->refreshState();
    obj = Util::findSingletonObject( Clips::CLASS_NAME );
    obj->refreshState();
    obj = Util::findSingletonObject( Colormaps::CLASS_NAME );
    obj->refreshState();
    obj = Util::findSingletonObject( TransformsData::CLASS_NAME);
    obj->refreshState();
    obj = Util::findSingletonObject( TransformsImage::CLASS_NAME);
    obj->refreshState();
    obj = Util::findSingletonObject( ErrorManager::CLASS_NAME );
    obj->refreshState();
    obj = Util::findSingletonObject( Preferences::CLASS_NAME );
    obj->refreshState();
    obj = Util::findSingletonObject( ChannelUnits::CLASS_NAME );
    obj->refreshState();
}

void ViewManager::_refreshState(){
    for ( Controller* control : m_controllers ){
        control->refreshState();
    }

    for ( Animator* anim : m_animators ){
        anim->refreshState();
    }
    for ( Histogram* hist : m_histograms ){
        hist->refreshState();
    }
    for ( Colormap* map : m_colormaps ){
        map->refreshState();
    }
    for ( Statistics* stat : m_statistics ){
        stat->refreshState();
    }
}

void ViewManager::reload(){
    _clear();
    _refreshStateSingletons();
    _initializeDefaultState();
}

void ViewManager::_removeView( const QString& plugin, int index ){

    Carta::State::ObjectManager* objMan = Carta::State::ObjectManager::objectManager();
    if ( plugin == NodeFactory::HIDDEN ){
        return;
    }
    else if ( plugin == Controller::PLUGIN_NAME ){
        //First remove all links to the controller.
        QString destId = m_controllers[index]->getPath();
        for ( Animator* animator : m_animators ){
            QString sourceId = animator->getPath();
            linkRemove( sourceId, destId );
        }
        for ( Statistics* stat : m_statistics ){
            QString sourceId = stat->getPath();
            linkRemove( sourceId, destId );
        }
        for ( Colormap* map : m_colormaps ){
            QString sourceId = map->getPath();
            linkRemove( sourceId, destId );
        }
        for ( Histogram* hist : m_histograms ){
            QString sourceId = hist->getPath();
            linkRemove( sourceId, destId );
        }
        objMan->destroyObject( m_controllers[index]->getId());
        m_controllers.removeAt( index );
    }
    else if ( plugin == Animator::CLASS_NAME ){
        objMan->destroyObject( m_animators[index]->getId());
        m_animators.removeAt( index );
    }
    else if ( plugin == Colormap::CLASS_NAME ){
        objMan->destroyObject( m_colormaps[index]->getId());
        m_colormaps.removeAt( index );
    }
    else if ( plugin == Histogram::CLASS_NAME ){
        objMan->destroyObject( m_histograms[index]->getId());
        m_histograms.removeAt( index );
    }
    else if ( plugin == Statistics::CLASS_NAME ){
        objMan->destroyObject( m_statistics[index]->getId());
        m_statistics.removeAt( index );
    }
    else {
        qWarning() << "Unrecognized plugin "<<plugin<<" to remove";
    }
}


void ViewManager::setAnalysisView(){
    if ( m_layout == nullptr ){
        _makeLayout();
    }
    if ( !m_layout->isLayoutAnalysis()){
        _clearHistograms( 1, m_histograms.size() );
        _clearAnimators( 1, m_animators.size() );
        _clearColormaps( 1, m_colormaps.size() );
        _clearStatistics( 1, m_statistics.size() );
        _clearControllers( 1, m_controllers.size() );

        m_layout->setLayoutAnalysis();

        //Add the links to establish reasonable defaults.
        m_animators[0]->addLink( m_controllers[0]);
        m_colormaps[0]->addLink( m_controllers[0]);
        m_statistics[0]->addLink( m_controllers[0]);
        m_histograms[0]->addLink( m_controllers[0]);
        m_histograms[0]->addLink( m_colormaps[0]);
        _refreshState();
    }
}

void ViewManager::setDeveloperView(){
    if ( m_layout == nullptr ){
        _makeLayout();
    }

    m_layout->setLayoutDeveloper();

    //Add the links to establish reasonable defaults.
    m_animators[0]->addLink( m_controllers[0]);
    m_histograms[0]->addLink( m_controllers[0]);
    m_colormaps[0]->addLink( m_controllers[0]);
    m_histograms[0]->addLink( m_colormaps[0]);
    _refreshState();
}

void ViewManager::setImageView(){
    if ( m_layout == nullptr ){
        _makeLayout();
    }
    if ( !m_layout->isLayoutImage() ){
        _clearHistograms( 0, m_histograms.size() );
        _clearAnimators( 0, m_animators.size() );
        _clearColormaps( 0, m_colormaps.size() );
        _clearStatistics( 0, m_statistics.size() );
        _clearControllers( 1, m_controllers.size() );

        m_layout->setLayoutImage();
    }
}

QString ViewManager::_setPlugin( const QString& sourceNodeId, const QString& destPluginType ){
    QString msg;
    if ( destPluginType != Controller::PLUGIN_NAME && destPluginType != Animator::CLASS_NAME &&
            destPluginType != Statistics::CLASS_NAME && destPluginType != Colormap::CLASS_NAME &&
            destPluginType != Histogram::CLASS_NAME && destPluginType != ViewPlugins::CLASS_NAME &&
            destPluginType != NodeFactory::HIDDEN ){
        msg = "Unrecognized plugin: "+destPluginType;
    }
    else {
        //Replace the plugin.
        _makeLayout();
        //Remove the replaced plugin from the view objects.
        QString replacedPlugin = m_layout->_getPlugin( sourceNodeId );
        if ( !replacedPlugin.isEmpty() ){
            int replacedIndex = m_layout->_getPluginIndex( sourceNodeId, replacedPlugin );
            if ( replacedIndex >= 0 ){
                _removeViews( replacedPlugin, replacedIndex, replacedIndex);
            }
        }

        //Update the layout so it knows what plugins should be displayed in the cells.
        bool pluginSet = m_layout->_setPlugin( sourceNodeId, destPluginType);
        if ( !pluginSet ){
            msg = "Unable to set plugin "+destPluginType;
        }
        else {
            //Add in the new view object
            int nodeIndex = m_layout->_getPluginCount( destPluginType );
            if ( nodeIndex > 0 ){
                getObjectId( destPluginType, nodeIndex-1, true );
            }
        }
    }
    return msg;
}


bool ViewManager::setPlugins( const QStringList& names ){
    bool pluginsSet = false;
    if ( m_layout ){
        QStringList oldNames = m_layout->getPluginList();
        bool valid = m_layout->_setPlugin( names, true);
        if ( !valid ){
            qDebug() << "Invalid plugins: "<<names;
        }
        else {
            _pluginsChanged( names, oldNames );
            pluginsSet = true;
        }
    }
    else {
        qWarning() << "A layout for the plugins is missing";
    }
    return pluginsSet;
}



ViewManager::~ViewManager(){
    Carta::State::ObjectManager* objMan = Carta::State::ObjectManager::objectManager();
    //objMan->printObjects();
    if ( m_layout != nullptr ){
        objMan->destroyObject( Layout::CLASS_NAME );
        m_layout = nullptr;
    }
    if ( m_dataLoader != nullptr ){
        objMan->destroyObject( m_dataLoader->getId() );
        m_dataLoader = nullptr;
    }
    if ( m_pluginsLoaded != nullptr ){
        objMan->destroyObject( m_pluginsLoaded->getId() );
        m_pluginsLoaded = nullptr;
    }
    if ( m_snapshots != nullptr ){
        objMan->destroyObject(  m_snapshots->getId() );
        m_snapshots = nullptr;
    }
    _clearAnimators( 0, m_animators.size() );
    _clearColormaps( 0, m_colormaps.size() );
    _clearHistograms( 0, m_histograms.size() );
    _clearStatistics( 0, m_statistics.size() );
    _clearControllers( 0, m_controllers.size() );

    //objMan->printObjects();
}
}
}

