#include "ControllerData.h"
#include "Grid/DataGrid.h"
#include "Contour/DataContours.h"
#include "DataSource.h"
#include "DrawSynchronizer.h"
#include "Data/Preferences/PreferencesSave.h"
#include "Data/Util.h"
#include "Data/Image/Grid/AxisMapper.h"
#include "Data/Image/Grid/LabelFormats.h"

#include "CartaLib/PixelPipeline/CustomizablePixelPipeline.h"
#include "CartaLib/IWcsGridRenderService.h"
#include "../../ImageRenderService.h"
#include "../../ImageSaveService.h"


#include <QDebug>
#include <QTime>

using Carta::Lib::AxisInfo;

namespace Carta {

namespace Data {

const QString ControllerData::CLASS_NAME = "ControllerData";
class ControllerData::Factory : public Carta::State::CartaObjectFactory {

public:

    Carta::State::CartaObject * create (const QString & path, const QString & id)
    {
        return new ControllerData(path, id);
    }
};
bool ControllerData::m_registered =
        Carta::State::ObjectManager::objectManager()->registerClass (CLASS_NAME,
                                                   new ControllerData::Factory());


ControllerData::ControllerData(const QString& path, const QString& id) :
    CartaObject( CLASS_NAME, path, id),
    m_dataSource( new DataSource() ),

    m_drawSync( nullptr ){

        Carta::State::ObjectManager* objMan = Carta::State::ObjectManager::objectManager();
        DataGrid* gridObj = objMan->createObject<DataGrid>();
        m_dataGrid.reset( gridObj );
        m_dataGrid->_initializeGridRenderer();
        _initializeState();
}


void ControllerData::_clearData(){
    Carta::State::ObjectManager* objMan = Carta::State::ObjectManager::objectManager();
    if ( m_dataGrid != nullptr){
        objMan->removeObject(m_dataGrid->getId());
    }
    if ( m_dataContours != nullptr){
        objMan->removeObject(m_dataContours->getId());
    }
}

bool ControllerData::_contains(const QString& fileName) const {
    bool representsData = false;
    if ( m_dataSource ){
        representsData = m_dataSource->_contains( fileName );
    }
    return representsData;
}

void ControllerData::_displayAxesChanged(std::vector<AxisInfo::KnownType> displayAxisTypes,
        const std::vector<int>& frames ){
    if ( m_dataSource ){
        m_dataSource->_setDisplayAxes( displayAxisTypes, frames );
    }
}

AxisInfo::KnownType ControllerData::_getAxisXType() const {
    AxisInfo::KnownType axisType = AxisInfo::KnownType::OTHER;
    if ( m_dataSource ){
        axisType = m_dataSource->_getAxisXType();
    }
    return axisType;
}

AxisInfo::KnownType ControllerData::_getAxisYType() const {
    AxisInfo::KnownType axisType = AxisInfo::KnownType::OTHER;
    if ( m_dataSource ){
        axisType = m_dataSource->_getAxisYType();
    }
    return axisType;
}

std::vector<AxisInfo::KnownType> ControllerData::_getAxisZTypes() const {
    std::vector<AxisInfo::KnownType> axisTypes;
    if ( m_dataSource ){
        axisTypes = m_dataSource->_getAxisZTypes();
    }
    return axisTypes;
}



std::vector<AxisInfo::KnownType> ControllerData::_getAxisTypes() const {
    std::vector<AxisInfo::KnownType> axisTypes;
    if ( m_dataSource ){
        axisTypes = m_dataSource->_getAxisTypes();
    }
    return axisTypes;
}

QStringList ControllerData::_getCoordinates( double x, double y,
        Carta::Lib::KnownSkyCS system, const std::vector<int>& frames ) const{
    QStringList coordStr;
    if ( m_dataSource ){
        coordStr = m_dataSource->_getCoordinates( x, y, system, frames );
    }
    return coordStr;
}

Carta::Lib::KnownSkyCS ControllerData::_getCoordinateSystem() const {
    Carta::Lib::KnownSkyCS cs = Carta::Lib::KnownSkyCS::Unknown;
    if ( m_dataGrid ){
        cs = m_dataGrid->_getSkyCS();
    }
    return cs;
}

QString ControllerData::_getCursorText( int mouseX, int mouseY, const std::vector<int>& frames ){
    QString cursorText;
    if ( m_dataSource ){
        Carta::Lib::KnownSkyCS cs = m_dataGrid->_getSkyCS();
        cursorText = m_dataSource->_getCursorText( mouseX, mouseY, cs, frames );
    }
    return cursorText;

}

QPointF ControllerData::_getCenter() const{
    QPointF center;
    if ( m_dataSource ){
        center = m_dataSource->_getCenter();
    }
    return center;;
}


Carta::State::StateInterface ControllerData::_getGridState() const {
    return m_dataGrid->_getState();
}

QPointF ControllerData::_getImagePt( QPointF screenPt, bool* valid ) const {
    QPointF imagePt;
    if ( m_dataSource ){
        imagePt = m_dataSource->_getImagePt( screenPt, valid );
    }
    else {
        *valid = false;
    }
    return imagePt;
}

QString ControllerData::_getPixelValue( double x, double y, const std::vector<int>& frames ) const {
    QString pixelValue = "";
    if ( m_dataSource ){
        pixelValue = m_dataSource->_getPixelValue( x, y, frames );
    }
    return pixelValue;
}


QPointF ControllerData::_getScreenPt( QPointF imagePt, bool* valid ) const {
    QPointF screenPt;
    if ( m_dataSource ){
        screenPt = m_dataSource->_getScreenPt( imagePt, valid );
    }
    else {
        *valid = false;
    }
    return screenPt;
}

int ControllerData::_getFrameCount( AxisInfo::KnownType type ) const {
    int frameCount = 1;
    if ( m_dataSource ){
        frameCount = m_dataSource->_getFrameCount( type );
    }
    return frameCount;
}



int ControllerData::_getDimension( int coordIndex ) const {
    int dim = -1;
    if ( m_dataSource ){
        dim = m_dataSource->_getDimension( coordIndex );
    }
    return dim;
}


int ControllerData::_getDimensions() const {
    int imageSize = 0;
    if ( m_dataSource ){
        imageSize = m_dataSource->_getDimensions();
    }
    return imageSize;
}

QString ControllerData::_getFileName() const {
    QString fileName = "";
    if ( m_dataSource ){
        fileName = m_dataSource->_getFileName();
    }
    return fileName;
}

std::shared_ptr<Image::ImageInterface> ControllerData::_getImage(){
    std::shared_ptr<Image::ImageInterface> image;
    if ( m_dataSource ){
        image = m_dataSource->_getImage();
    }
    return image;
}


std::shared_ptr<Carta::Lib::PixelPipeline::CustomizablePixelPipeline> ControllerData::_getPipeline() const {
    std::shared_ptr<Carta::Lib::PixelPipeline::CustomizablePixelPipeline> pipeline;
    if ( m_dataSource ){
        pipeline = m_dataSource->_getPipeline();
    }
    return pipeline;

}

bool ControllerData::_getIntensity( int frameLow, int frameHigh, double percentile, double* intensity ) const {
    bool intensityFound = false;
    if ( m_dataSource ){
        intensityFound = m_dataSource->_getIntensity( frameLow, frameHigh, percentile, intensity );
    }
    return intensityFound;
}

double ControllerData::_getPercentile( int frameLow, int frameHigh, double intensity ) const {
    double percentile = 0;
    if ( m_dataSource ){
        percentile = m_dataSource->_getPercentile( frameLow, frameHigh, intensity );
    }
    return percentile;
}

QStringList ControllerData::_getPixelCoordinates( double ra, double dec ) const{
    QStringList result("");
    if ( m_dataSource ){
        result = m_dataSource->_getPixelCoordinates( ra, dec );
    }
    return result;
}

QString ControllerData::_getPixelUnits() const {
    QString units;
    if ( m_dataSource ){
        units = m_dataSource->_getPixelUnits();
    }
    return units;
}

QString ControllerData::_getStateString() const{
    QString stateStr = m_state.toString();
    return stateStr;
}

double ControllerData::_getZoom() const {
    double zoom = DataSource::ZOOM_DEFAULT;
    if ( m_dataSource ){
        zoom = m_dataSource-> _getZoom();
    }
    return zoom;
}

QSize ControllerData::_getOutputSize() const {
    QSize size;
    if ( m_dataSource ){
        size = m_dataSource-> _getOutputSize();
    }
    return size;
}


void ControllerData::_gridChanged( const Carta::State::StateInterface& state, bool renderImage,
        const std::vector<int>& frames ){
    m_dataGrid->_resetState( state );
    m_state.setObject(DataGrid::GRID, m_dataGrid->_getState().toString());
    if ( renderImage ){
        const Carta::Lib::KnownSkyCS& cs = _getCoordinateSystem();
        _render( frames, cs );
    }
}

void ControllerData::_initializeState(){
    m_state.insertValue<QString>(DataSource::DATA_PATH, "");
    QString gridState = _getGridState().toString();
    m_state.insertObject(DataGrid::GRID, gridState );
}

void ControllerData::_renderingDone(
        QImage image,
        Carta::Lib::VectorGraphics::VGList gridVG,
        Carta::Lib::VectorGraphics::VGList contourVG,
        int64_t /*jobId*/){
    /// \todo we should make sure the jobId matches the last submitted job...

    m_qimage = image;

    // draw the grid over top
    //QTime t;
    //t.restart();
    QPainter painter( & m_qimage );
    painter.setRenderHint( QPainter::Antialiasing, true );
    Carta::Lib::VectorGraphics::VGListQPainterRenderer vgRenderer;
    if ( m_dataGrid->_isGridVisible() ){
        if ( ! vgRenderer.render( gridVG, painter ) ) {
            qWarning() << "could not render grid vector graphics";
        }
        //qDebug() << "Grid VG rendered in" << t.elapsed() / 1000.0 << "sec" << "xyz";
    }
    //t.restart();

    if ( m_dataContours->isContourDraw()){
        QPen lineColor( QColor( "red" ), 1 );
        lineColor.setCosmetic( true );
        painter.setPen( lineColor );

        // where does 0.5, 0.5 map to?
        if ( m_dataSource ){
            bool valid1 = false;
            QPointF p1 = m_dataSource->_getScreenPt( { 0.5, 0.5 }, &valid1 );

            // where does 1.5, 1.5 map to?
            bool valid2 = false;
            QPointF p2 = m_dataSource->_getScreenPt( { 1.5, 1.5 }, &valid2 );
            if ( valid1 && valid2 ){
                QTransform tf;
                double m11 = p2.x() - p1.x();
                double m22 = p2.y() - p1.y();
                double m33 = 1; // no projection
                double m13 = 0; // no projection
                double m23 = 0; // no projection
                double m12 = 0; // no shearing
                double m21 = 0; // no shearing
                double m31 = p1.x() - m11 * 0.5;
                double m32 = p1.y() - m22 * 0.5;
                tf.setMatrix( m11, m12, m13, m21, m22, m23, m31, m32, m33 );
                painter.setTransform( tf );
            }
        }

        if ( ! vgRenderer.render( contourVG, painter ) ) {
            qWarning() << "could not render contour vector graphics";
        }
    //qDebug() << "Contour VG rendered in" << t.elapsed() / 1000.0 << "sec" << "xyz";
    }


    // schedule a repaint with the connector
    emit renderingDone( m_qimage );
}


void ControllerData::_load(vector<int> frames, bool /*recomputeClipsOnNewFrame*/,
        double minClipPercentile, double maxClipPercentile, const Carta::Lib::KnownSkyCS& cs ){
    if ( m_dataSource ){
        m_dataSource->_load( frames, /*recomputeClipsOnNewFrame,*/
                minClipPercentile, maxClipPercentile );
        if ( m_dataGrid ){
            if ( m_dataGrid->_isGridVisible() ){
                std::shared_ptr<Carta::Lib::IWcsGridRenderService> gridService = m_dataGrid->_getRenderer();
                gridService-> setInputImage( m_dataSource->_getImage() );
            }
        }
        _render( frames, cs );
    }
}



void ControllerData::_render( const std::vector<int>& frames, const Carta::Lib::KnownSkyCS& cs ){
    // erase current grid
    std::shared_ptr<Carta::Lib::IWcsGridRenderService> gridService = m_dataGrid->_getRenderer();
    std::shared_ptr<Carta::Core::ImageRenderService::Service> imageService = m_dataSource->_getRenderer();
    QSize renderSize = imageService-> outputSize();
    gridService-> setOutputSize( renderSize );

    int leftMargin = m_dataGrid->_getMargin( LabelFormats::EAST );
    int rightMargin = m_dataGrid->_getMargin( LabelFormats::WEST );
    int topMargin = m_dataGrid->_getMargin( LabelFormats::NORTH );
    int bottomMargin = m_dataGrid->_getMargin( LabelFormats::SOUTH );

    QRectF outputRect( leftMargin, topMargin,
                       renderSize.width() - leftMargin - rightMargin,
                       renderSize.height() - topMargin - bottomMargin );

    QPointF topLeft = outputRect.topLeft();
    QPointF bottomRight = outputRect.bottomRight();

    std::vector<int> axisPerms = m_dataSource->_getAxisPerms();

    QPointF topLeftInput = imageService-> screen2img( topLeft );
    QPointF bottomRightInput = imageService->screen2img( bottomRight );

    gridService->setAxisPermutations( axisPerms );

    QRectF inputRect( topLeftInput, bottomRightInput );

    gridService-> setImageRect( inputRect );
    gridService-> setOutputRect( outputRect );


    std::shared_ptr<NdArray::RawViewInterface> rawData( m_dataSource->_getRawData( frames ));
    m_drawSync->setInput( rawData );
    m_drawSync->setContours( m_dataContours );

    //Which display axes will be drawn.
    AxisInfo::KnownType xType = m_dataSource->_getAxisXType();
    AxisInfo::KnownType yType = m_dataSource->_getAxisYType();
    QString displayLabelX = AxisMapper::getPurpose( xType, cs );
    QString displayLabelY = AxisMapper::getPurpose( yType, cs );
    gridService->setAxisLabel( 0, displayLabelX );
    gridService->setAxisLabel( 1, displayLabelY );

    AxisInfo::KnownType horAxisType = m_dataSource->_getAxisXType();
    Carta::Lib::AxisLabelInfo horAxisInfo = m_dataGrid->_getAxisLabelInfo( 0, horAxisType, cs );
    gridService->setAxisLabelInfo( 0, horAxisInfo );
    AxisInfo::KnownType vertAxisType = m_dataSource->_getAxisYType();
    Carta::Lib::AxisLabelInfo vertAxisInfo = m_dataGrid->_getAxisLabelInfo( 1, vertAxisType, cs );
    gridService->setAxisLabelInfo( 1, vertAxisInfo );

    bool contourDraw = m_dataContours->isContourDraw();
    bool gridDraw = m_dataGrid->_isGridVisible();
    m_drawSync-> start( contourDraw, gridDraw );
}




void ControllerData::_resetZoom(){
    if ( m_dataSource ){
        m_dataSource->_resetZoom();
    }
}

void ControllerData::_resetPan(){
    if ( m_dataSource ){
        m_dataSource->_resetPan();
    }
}

QString ControllerData::_saveImage( const QString& saveName, double scale,
        const std::vector<int>& frames ){
    QString result;
    if ( m_dataSource ){

        std::shared_ptr<Carta::Lib::PixelPipeline::CustomizablePixelPipeline> pipeline =
                m_dataSource->_getPipeline();
        m_saveService = new Carta::Core::ImageSaveService::ImageSaveService( saveName,
               pipeline );

        std::shared_ptr<NdArray::RawViewInterface> view( m_dataSource->_getRawData( frames ));
        if ( view != nullptr ){
            QString viewId = m_dataSource->_getViewIdCurrent( frames );
            m_saveService->setInputView( view, viewId );
            PreferencesSave* prefSave = Util::findSingletonObject<PreferencesSave>();
            int width = prefSave->getWidth();
            int height = prefSave->getHeight();
            Qt::AspectRatioMode aspectRatioMode = prefSave->getAspectRatioMode();
            m_saveService->setOutputSize( QSize( width, height ) );
            m_saveService->setAspectRatioMode( aspectRatioMode );
            std::pair<int,int> displayDims = m_dataSource->_getDisplayDims();
            m_saveService->setDisplayShape( displayDims.first, displayDims.second );

            m_saveService->setZoom( scale );

            connect( m_saveService, & Carta::Core::ImageSaveService::ImageSaveService::saveImageResult,
                    this, & ControllerData::_saveImageResultCB );

            bool saveStarted = m_saveService->saveFullImage();
            if ( !saveStarted ){
                result = "Image was not rendered";
            }
        }
        else {
            result = "There was no data to save.";
        }
    }
    else {
        result = "There was no image to save.";
    }
    return result;
}

void ControllerData::_saveImageResultCB( bool result ){
    emit saveImageResult( result );
    m_saveService->deleteLater();
}

void ControllerData::_setContours( std::shared_ptr<DataContours> contours ){
    m_dataContours = contours;

    std::shared_ptr<Carta::Lib::IWcsGridRenderService> gridService = m_dataGrid->_getRenderer();
    std::shared_ptr<Carta::Core::ImageRenderService::Service> imageService = m_dataSource->_getRenderer();

    // create the synchronizer
    m_drawSync.reset( new DrawSynchronizer( imageService, gridService, this ) );

    // connect its done() slot to our renderingSlot()
    connect( m_drawSync.get(), & DrawSynchronizer::done,
                     this, & ControllerData::_renderingDone );
}

bool ControllerData::_setFileName( const QString& fileName ){
    bool successfulLoad = m_dataSource->_setFileName( fileName );
    if ( successfulLoad ){
        m_state.setValue<QString>(DataSource::DATA_PATH, fileName);
    }
    return successfulLoad;
}

void ControllerData::setColorMap( const QString& name ){
    if ( m_dataSource ){
        m_dataSource->setColorMap( name );
    }
}

void ControllerData::setColorInverted( bool inverted ){
    if ( m_dataSource ){
        m_dataSource->setColorInverted( inverted );
    }
}

void ControllerData::setColorReversed( bool reversed ){
    if ( m_dataSource ){
        m_dataSource->setColorReversed( reversed );
    }
}

void ControllerData::setColorAmounts( double newRed, double newGreen, double newBlue ){
    if ( m_dataSource ){
        m_dataSource->setColorAmounts( newRed, newGreen, newBlue );
    }
}

void ControllerData::_setPan( double imgX, double imgY ){
    if ( m_dataSource ){
        m_dataSource-> _setPan( imgX, imgY );
    }
}

void ControllerData::_setTransformData( const QString& name ){
    if ( m_dataSource ){
        m_dataSource->_setTransformData( name );
    }
}

void ControllerData::_setZoom( double zoomAmount){
    if ( m_dataSource ){
        m_dataSource-> _setZoom( zoomAmount );
    }
}



void ControllerData::setGamma( double gamma ){
    if ( m_dataSource ){
        m_dataSource->setGamma( gamma );
    }
}

void ControllerData::_updateClips( std::shared_ptr<NdArray::RawViewInterface>& view,
        double minClipPercentile, double maxClipPercentile, const std::vector<int>& frames ){
    if ( m_dataSource ){
        m_dataSource->_updateClips( view,  minClipPercentile, maxClipPercentile, frames );
    }
}

void ControllerData::_viewResize( const QSize& newSize ){
    if ( m_dataSource ){
        m_dataSource->_viewResize( newSize );
    }
}


ControllerData::~ControllerData() {
    _clearData();
}
}
}
