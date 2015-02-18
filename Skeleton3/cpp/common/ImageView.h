#include "IView.h"
#include <QImage>
#include <QColor>

class IConnector;
class StateInterface;

class ImageView: public QObject, public IView {

Q_OBJECT

public:

    ImageView(const QString & viewName, QColor bgColor, QImage img, StateInterface* mouseState);

    void resetImage(QImage img);
    virtual void registration(IConnector *connector);
    virtual const QString & name() const;
    virtual QSize size();
    virtual const QImage & getBuffer();
    virtual void handleResizeRequest(const QSize & size);
    virtual void handleMouseEvent(const QMouseEvent & ev);
    virtual void handleKeyEvent(const QKeyEvent & /*event*/);
    static const QString MOUSE;
    static const QString MOUSE_X;
    static const QString MOUSE_Y;
    static const QString VIEW;

signals:
    //Signal the image needs to be resized.
    void resize( const QSize& size );

protected:

    void redrawBuffer();

    QColor m_bgColor;
    QImage m_defaultImage;
    IConnector * m_connector;
    QImage m_qimage;
    QString m_viewName;
    int m_timerId;
    QPointF m_lastMouse;
    StateInterface* m_mouseState;


};

