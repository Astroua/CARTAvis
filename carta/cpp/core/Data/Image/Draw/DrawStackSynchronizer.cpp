#include "DrawStackSynchronizer.h"
#include "Data/Image/Layer.h"
#include "Data/Image/LayerCompositionModes.h"
#include "CartaLib/IRemoteVGView.h"


#include <QtCore/QDebug>

namespace Carta {

namespace Data {


DrawStackSynchronizer::DrawStackSynchronizer( Carta::Lib::LayeredRemoteVGView* view ){
    m_repaintFrameQueued = false;
    m_selectIndex = -1;
    m_view.reset( view );
    connect( m_view.get(), SIGNAL(sizeChanged()), this, SIGNAL( viewResize() ) );
}

void DrawStackSynchronizer::_clear(){
    m_view->resetLayers();
    QMetaObject::invokeMethod( this, "_repaintFrameNow", Qt::QueuedConnection );
}

QSize DrawStackSynchronizer::getClientSize() const {
    return m_view->getClientSize();
}


void DrawStackSynchronizer::_repaintFrameNow(){
    m_view->scheduleRepaint();

}


void DrawStackSynchronizer::_render( const std::shared_ptr<RenderRequest>& request ){
    if ( m_repaintFrameQueued ){
        emit done( false );
        return;
    }
    QSize clientSize = getClientSize();
    if ( clientSize.width() <= 1 || clientSize.height() <= 1 ){
        emit done( false );
        return;
    }
    m_repaintFrameQueued = true;
    QList<std::shared_ptr<Layer> > datas = request->getData();
    int dataCount = datas.size();
    m_images.clear();
    m_layers = datas;
    int topIndex = request->getTopIndex();
    m_selectIndex = topIndex;
    m_renderCount = 0;
    m_redrawCount = dataCount;
    for ( int i = 0; i < dataCount; i++ ){
        if ( datas[i]->_isVisible() ){
            connect( datas[i].get(), SIGNAL(renderingDone(const std::shared_ptr<RenderResponse>&)),
                    this, SLOT(_scheduleFrameRepaint(const std::shared_ptr<RenderResponse>&)),
                    Qt::UniqueConnection);
            bool topOfStack = false;
            if ( i == topIndex ){
                topOfStack = true;
            }
            std::shared_ptr<RenderRequest> layerRequest( new RenderRequest(
                                   *request ));
            layerRequest->setStackTop( topOfStack );
            datas[i]->_render( layerRequest );
        }
    }
    if ( dataCount == 0 ){

        m_repaintFrameQueued = false;
        _clear();
        emit done( true );
    }
}


void DrawStackSynchronizer::_scheduleFrameRepaint( const std::shared_ptr<RenderResponse>& response ){

    if ( !m_repaintFrameQueued ){
        return;
    }
    // if reload is already pending, do nothing
    m_renderCount++;
    m_images[response->getLayerName()] = response;
    if ( m_renderCount != m_redrawCount ) {
        return;
    }
    m_view->resetLayers();

    //We want the selected index to be the last one in the stack.
    int dataCount = m_layers.size();
    int stackIndex = 0;
    for ( int i = 0; i < dataCount; i++ ){
        int dIndex = ( m_selectIndex + i + 1) % dataCount;
        m_layers[dIndex]->disconnect( this );
        bool layerEmpty = m_layers[dIndex]->_isEmpty();
        bool layerVisible = m_layers[dIndex]->_isVisible();
        if ( layerVisible && !layerEmpty){
            QString layerName = m_layers[dIndex]->_getLayerId();
            if ( m_images.contains( layerName ) ){
                QImage image = m_images[layerName]->getImage();
                Carta::Lib::VectorGraphics::VGList graphicsList = m_images[layerName]->getVectorGraphics();
                m_view->setRasterLayer( stackIndex, image );
                std::shared_ptr<Carta::Lib::AlphaCombiner> alphaCombine =
                        std::make_shared<Carta::Lib::AlphaCombiner>();
                float alphaVal = m_layers[dIndex]->_getMaskAlpha();
                alphaCombine-> setAlpha( alphaVal );
                m_view->setRasterLayerCombiner( stackIndex, alphaCombine );
                m_view->setVGLayer( stackIndex, graphicsList );
                stackIndex++;
            }
        }
    }
    m_repaintFrameQueued = false;
    emit done( true );
    QMetaObject::invokeMethod( this, "_repaintFrameNow", Qt::QueuedConnection );
    for ( int i = 0; i < dataCount; i++ ){
        m_layers[i]->_renderDone();
    }
}




DrawStackSynchronizer::~DrawStackSynchronizer(){

}

}
}
