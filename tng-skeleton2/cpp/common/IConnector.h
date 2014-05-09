#ifndef ICONNECTOR_H
#define ICONNECTOR_H

#include "IView.h"
#include <memory>
#include <functional>
#include <cstdint>
#include <QString>
#include <QMouseEvent>
#include <QKeyEvent>

/**
 * @brief The IConnector interface offers common API that the C++ code uses
 * to communicate with the JavaScript side. Different implementations are used
 * for desktop vs server-side versions.
 */

class IConnector {
public:

    /// alias for const QString &
    typedef const QString & CSR;

    /// shared pointer type for convenience
    typedef std::shared_ptr< IConnector > SharedPtr;

    /// signature for command callback
    typedef std::function<QString(CSR cmd, CSR params, CSR sessionId)> CommandCallback;

    /// signature for state changed callback
    typedef std::function<void (CSR path, CSR newValue)> StateChangedCallback;

    /// callback ID type (needed to remove callbacks)
    typedef int64_t CallbackID;

    /// initializes the connector
    virtual bool initialize() = 0;

    /// registers a view with the connector
    virtual void registerView( IView * view) = 0;

    /// asks the connector to schedule a redraw of the view
    virtual void refreshView( IView * view) = 0;

    /// set state to a new value
    virtual void setState( const QString & path, const QString & value) = 0;

    /// read state
    virtual QString getState( const QString & path) = 0;

    /// add a callback for a command
    virtual CallbackID addCommandCallback( const QString & cmd, const CommandCallback & cb) = 0;

    /// add a callback for a state change event
    virtual CallbackID addStateCallback( CSR path, const StateChangedCallback & cb) = 0;

    /// remove a callback for a state change event
    virtual void removeStateCallback( const CallbackID & id ) = 0;

    virtual ~IConnector() {}
};



#endif // ICONNECTOR_H
