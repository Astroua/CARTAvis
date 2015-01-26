/**
 *
 **/

#include "DesktopConnector.h"
#include "common/LinearMap.h"
#include "common/MyQApp.h"
//#include "common/State/StateXmlRestorer.h"
//#include "common/State/StateReader.h"
//#include "DesktopStateWriter.h"
#include <iostream>
#include <QImage>
#include <QPainter>
#include <QXmlInputSource>
#include <cmath>
#include <QTime>
#include <QTimer>
#include <QCoreApplication>
#include <functional>

///
/// \brief internal class of DesktopConnector, containing extra information we like
///  to remember with each view
///
struct DesktopConnector::ViewInfo
{

    /// the implemented IView
    IView * view;

    /// last received client size
    QSize clientSize;

    /// linear maps convert x,y from client to image coordinates
    LinearMap1D tx, ty;

    /// refresh timer for this object
    QTimer refreshTimer;

    ViewInfo( IView * pview )
    {
        view = pview;
        clientSize = QSize(1,1);
        refreshTimer.setSingleShot( true);
        // just long enough that two successive calls will result in only one redraw :)
        refreshTimer.setInterval( 1);
    }

};

DesktopConnector::DesktopConnector()
{
    // queued connection to prevent callbacks from firing inside setState
    connect( this, & DesktopConnector::stateChangedSignal,
             this, & DesktopConnector::stateChangedSlot,
             Qt::QueuedConnection );

    m_callbackNextId = 0;
}

void DesktopConnector::initialize(const InitializeCallback & cb)
{
    m_initializeCallback = cb;
}

void DesktopConnector::setState(const QString& path, const QString & newValue)
{
    // find the path
    auto it = m_state.find( path);

    // if we cannot find it, insert it, together with the new value, and emit a change
    if( it == m_state.end()) {
        m_state[path] = newValue;
        emit stateChangedSignal( path, newValue);
        return;
    }

    // if we did find it, but the value is different, set it to new value (optimized)
    // and emit signal
    if( it-> second != newValue) {
        it-> second = newValue;
        emit stateChangedSignal( path, newValue);
    }

    // otherwise don't do anything at all

//    if( it != m_state.end() && it-> second == newValue) {
//        // if we alredy have an entry for this path and the stored value is
//        // the same as the incoming value, we don't want to do anything
//        return;
//    }
//    m_state[path] = newValue;
//    emit stateChangedSignal( path, newValue);
}


QString DesktopConnector::getState(const QString & path  )
{
    return m_state[ path ];
}


/// Return the location where the state is saved.
QString DesktopConnector::getStateLocation( const QString& saveName ) const {
	//TODO: Generalize this.
	return "/tmp/"+saveName+".json";
}

IConnector::CallbackID DesktopConnector::addCommandCallback(
        const QString & cmd,
        const IConnector::CommandCallback & cb)
{
    m_commandCallbackMap[cmd].push_back( cb);
    return m_callbackNextId++;
}

IConnector::CallbackID DesktopConnector::addStateCallback(
        IConnector::CSR path,
        const IConnector::StateChangedCallback & cb)
{
    // find the list of callbacks for this path
    auto iter = m_stateCallbackList.find( path);

    // if it does not exist, create it
    if( iter == m_stateCallbackList.end()) {
//        qDebug() << "Creating callback list for variable " << path;
        auto res = m_stateCallbackList.insert( std::make_pair(path, new StateCBList));
        iter = res.first;
    }

    iter = m_stateCallbackList.find( path);
    if( iter == m_stateCallbackList.end()) {
//        qDebug() << "What the hell";
    }

    // add the calllback
    return iter-> second-> add( cb);

//    return m_stateCallbackList[ path].add( cb);
}

void DesktopConnector::registerView(IView * view)
{
    // let the view know it's registered, and give it access to the connector
    view->registration( this);

    // insert this view int our list of views
    ViewInfo * viewInfo = new ViewInfo( view);
//    viewInfo-> view = view;
//    viewInfo-> clientSize = QSize(1,1);
    m_views[ view-> name()] = viewInfo;

    // connect the view's refresh timer to a lambda, which will in turn call
    // refreshViewNow()
    connect( & viewInfo->refreshTimer, & QTimer::timeout,
            [=] () {
                     refreshViewNow( view);
    });
}

// unregister the view
void DesktopConnector::unregisterView( const QString& viewName ){
    ViewInfo* viewInfo = this->findViewInfo( viewName );
    if ( viewInfo != nullptr ){
        bool disconnected =(& viewInfo->refreshTimer)->disconnect();
        m_views.erase( viewName );
    }
}

//    static QTime st;

// schedule a view refresh
void DesktopConnector::refreshView(IView * view)
{
    // find the corresponding view info
    ViewInfo * viewInfo = findViewInfo( view-> name());
    if( ! viewInfo) {
        // this is an internal error...
        qCritical() << "refreshView cannot find this view: " << view-> name();
        return;
    }

    // start the timer for this view if it's not already started
    if( ! viewInfo-> refreshTimer.isActive()) {
        viewInfo-> refreshTimer.start();
    }
    else {
//        qDebug() << "########### saved refresh for " << view->name();
    }
}

void DesktopConnector::removeStateCallback(const IConnector::CallbackID & /*id*/)
{
    qFatal( "not implemented");
}

void DesktopConnector::jsSetStateSlot(const QString & key, const QString & value) {
    // it's ok to call setState directly, because callbacks will be invoked
    // from there asynchronously
    setState( key, value );
}

void DesktopConnector::jsSendCommandSlot(const QString &cmd, const QString & parameter)
{
    // call all registered callbacks and collect results, but asynchronously
    defer( [cmd, parameter, this ]() {
        auto & allCallbacks = m_commandCallbackMap[ cmd];
        QStringList results;
        for( auto & cb : allCallbacks) {
            results += cb( cmd, parameter, "1"); // session id fixed to "1"
        }

        // pass results back to javascript
        emit jsCommandResultsSignal( results.join("|"));
    });
}

void DesktopConnector::jsConnectorReadySlot()
{
    // at this point it's safe to start using setState as the javascript
    // connector has registered to listen for the signal
    qDebug() << "JS Connector is ready!!!!";

    // time to call the initialize callback
    defer( std::bind( m_initializeCallback, true));

//    m_initializeCallback(true);
}

DesktopConnector::ViewInfo * DesktopConnector::findViewInfo( const QString & viewName)
{
    auto viewIter = m_views.find( viewName);
    if( viewIter == m_views.end()) {
        qWarning() << "DesktopConnector::findViewInfo: Unknown view " << viewName;
        return nullptr;
    }

    return viewIter-> second;
}

void DesktopConnector::refreshViewNow(IView *view)
{
    ViewInfo * viewInfo = findViewInfo( view-> name());
    if( ! viewInfo) {
        // this is an internal error...
        qCritical() << "refreshView cannot find this view: " << view-> name();
        return;
    }
    // get the image from view
    const QImage & origImage = view-> getBuffer();
    // scale the image to fit the client size
    QImage destImage = origImage.scaled(
                viewInfo->clientSize, Qt::KeepAspectRatio,
                //                Qt::SmoothTransformation);
                Qt::FastTransformation);
    // calculate the offset needed to center the image
    int xOffset = (viewInfo-> clientSize.width() - destImage.size().width())/2;
    int yOffset = (viewInfo-> clientSize.height() - destImage.size().height())/2;
    QImage pix( viewInfo->clientSize, QImage::Format_ARGB32_Premultiplied);
    pix.fill( qRgba( 0, 0, 0, 0));
    QPainter p( & pix);
    p.setCompositionMode( QPainter::CompositionMode_Source);
    p.drawImage( xOffset, yOffset, destImage );

    // remember the transformations we did to the image in the viewInfo so that we can
    // properly translate mouse events etc
    viewInfo-> tx = LinearMap1D( xOffset, xOffset + destImage.size().width()-1,
                                 0, origImage.width()-1);
    viewInfo-> ty = LinearMap1D( yOffset, yOffset + destImage.size().height()-1,
                                 0, origImage.height()-1);

    emit jsViewUpdatedSignal( view-> name(), pix);
}

void DesktopConnector::jsUpdateViewSlot(const QString & viewName, int width, int height)
{
    ViewInfo * viewInfo = findViewInfo( viewName);
    if( ! viewInfo) {
        qWarning() << "Received update for unknown view " << viewName;
        return;
    }

    IView * view = viewInfo-> view;
    viewInfo-> clientSize = QSize( width, height);

    defer([this,view,viewInfo](){
        view-> handleResizeRequest( viewInfo-> clientSize);
        refreshView( view);
    });
}

void DesktopConnector::jsMouseMoveSlot(const QString &viewName, int x, int y)
{
    ViewInfo * viewInfo = findViewInfo( viewName);
    if( ! viewInfo) {
        qWarning() << "Received mouse event for unknown view " << viewName << "\n";
        return;
    }

    IView * view = viewInfo-> view;

    // we need to map x,y from screen coordinates to image coordinates
    int xi = std::round( viewInfo-> tx(x));
    int yi = std::round( viewInfo-> ty(y));

    // tell the view about the event
    QMouseEvent ev( QEvent::MouseMove,
                    QPoint(xi,yi),
                    Qt::NoButton,
                    Qt::NoButton,
                    Qt::NoModifier   );
    view-> handleMouseEvent( ev);
}

void DesktopConnector::stateChangedSlot(const QString & key, const QString & value)
{
    // find the list of callbacks for this path
    auto iter = m_stateCallbackList.find( key);

    // if it does not exist, do nothing
    if( iter == m_stateCallbackList.end()) {
        return;
    }

    // call all registered callbacks for this key
    iter-> second-> callEveryone( key, value);
}
