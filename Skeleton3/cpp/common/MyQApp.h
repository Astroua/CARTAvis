#pragma once

#include <QApplication>
#include <functional>
#include "IConnector.h"

/// I suspect somewhere down the road we'll want to override notify() or some
/// other functionality of QApplication, so we might as well provision for it by
/// subclassing QApplication and using the subclass...
///
/// The only code that should go into this class is Qt specific stuff that needs
/// access to the internals of QApplication.
class MyQApp : public QApplication
{
    Q_OBJECT

public:

    explicit
    MyQApp( int & argc, char * * argv );

    /**
     * @brief set the platform
     * @param return the platform
     */

protected:
};

// convenience function for deferred function calls

/// execute the the given function later (essentially at the next noop of the QtMainLoop)
/// \param function to execute
/// \note if you need to execute function with some parameters, use std::bind
void
defer( const std::function < void() > & function );

/// \brief Internal class to implement defer()
/// \internal
///
/// \note It lives in this include file because it's easier to convince MOC to
/// process it (since it's QObject)
class DeferHelper : public QObject
{
    Q_OBJECT

public:

    typedef std::function < void ( ) > VoidFunc;

    void
    queue( const VoidFunc & func );

public slots:

    void
    execute( const VoidFunc & func );
};
