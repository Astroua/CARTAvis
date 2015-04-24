/*
 * ObjectManager.h
 *
 *  Created on: Oct 3, 2014
 *      Author: jjacobs
 */

#ifndef OBJECTMANAGER_H_
#define OBJECTMANAGER_H_

#include <map>
#include <QString>
#include <QTextStream>
#include "StateInterface.h"
#include "../IConnector.h"


class CartaObject {

public:

    virtual ~CartaObject () {};


    QString addIdToCommand (const QString & commandName) const;
    //Snapshots of state that can be saved.
    typedef enum SnapshotType { SNAPSHOT_DATA, SNAPSHOT_PREFERENCES, SNAPSHOT_LAYOUT } SnapshotType;

    /**
     * Returns a json representation of this object's state.
     * @param sessionId - an identifier for a user's session.
     * @param type an identifier for the type of state to be returned.
     * @return a QString representing this object's state.
     */
    virtual QString getStateString( const QString& sessionId, SnapshotType type ) const;
    QString getClassName () const;
    QString getId () const;
    QString getPath () const;

    /**
     * Reset the state of this object.
     * @param state a QString representing a new state for this object.
     */
    void resetState( const QString& state, SnapshotType type );

    /**
     * Reset the data state of this object.
     * @param state a QString representing the data state of the object.
     */
    //By default; does nothing.  Override for objects containing a data state.
    virtual void resetStateData( const QString& state );

    /**
     * Reset the user preferences for this object.
     * @param state - the user preferences for the object.
     */
    virtual void resetState( const QString& state );

protected:

    CartaObject (const QString & className,
            const QString & path,
            const QString & id);

    void addCommandCallback (const QString & command, IConnector::CommandCallback);

    int64_t addStateCallback( const QString& statePath, const IConnector::StateChangedCallback &);

    /// asks the connector to schedule a redraw of the view
    void refreshView( IView * view);

    /// registers a view with the connector
    void registerView( IView * view);

    /// unregister a view with the connector
    void unregisterView();

    //Return the full location for the state with the given name.
    QString getStateLocation( const QString& name ) const;

    QString removeId (const QString & commandAndId);


    template <typename Object, typename Method>
    class OnCommand {
        public:
            OnCommand (Object * object, Method method)
                : m_method (method), m_object (object)
                {}

            QString operator() (const QString & commandAndId, const QString & parameters,
                const QString & sessionID){
                QString command = m_object->removeId (commandAndId);
                return (m_object ->* m_method) (command, parameters, sessionID);
            }
        private:

            Method m_method;
            Object * m_object;
    };

protected:
    StateInterface m_state;

private:

    QString m_className;
    QString m_id;
    QString m_path;

    static const char m_Delimiter = ':';

};

class CartaObjectFactory {

public:

    CartaObjectFactory( const QString& globalId=""):
        m_globalId( globalId ){}
    QString getGlobalId(){
        QString globalId;
        if ( globalIds.contains( m_globalId)){
            globalId = m_globalId;
        }
        return globalId;
    }


    virtual ~CartaObjectFactory (){}

    virtual CartaObject * create (const QString & path, const QString & id) = 0;


private:
    static QList<QString> globalIds;
    QString m_globalId;
};

class ObjectManager {

public:

    ~ObjectManager ();

    QString createObject (const QString & className);
    QString destroyObject (const QString & id);
    CartaObject * getObject (const QString & id);

    /**
     * Returns a string containing the state of all managed objects as JSON array of strings.
     * @param sessionId - an identifier for a user's session.
     * @param snapName - the name of the snapshot.
     * @param type - the type of state needed.
     * @return a QString containing the entire state of managed objects.
     */
    QString getStateString( const QString& sessionId, const QString& snapName, CartaObject::SnapshotType type ) const;
    void initialize ();
    bool registerClass (const QString & className, CartaObjectFactory * factory);
    ///Initialize the state variables that were persisted.
    //bool readState( const QString& fileName );
    //bool saveState( const QString& fileName );
    static ObjectManager * objectManager (); // singleton accessor
    QString getRootPath() const;
    QString getRoot() const;
    QString parseId( const QString& path ) const;

    class OnCreateObject{
    public:
        OnCreateObject (ObjectManager * objectManager) : m_objectManager (objectManager) {}

        QString operator() (const QString & /*command*/, const QString & parameters,
                const QString & /*sessionId*/)
        {
            return m_objectManager -> createObject (parameters);
        }

    private:

        ObjectManager * m_objectManager;
    };

    class OnDestroyObject{
    public:
        OnDestroyObject (ObjectManager * objectManager) : m_objectManager (objectManager) {}

        QString operator() (const QString & /*command*/, const QString & parameters,
                const QString & /*sessionId*/)
        {
            return m_objectManager -> destroyObject (parameters);
        }

    private:

        ObjectManager * m_objectManager;
    };

    static const QString CreateObject;
    static const QString ClassName;
    static const QString DestroyObject;
    static const QString STATE_ARRAY;
    static const QString STATE_ID;
    static const QString STATE_VALUE;

private:

    /// stores a pair< QString, CartaObjectFactory >
    class ClassRegistryEntry {

    public:

        ClassRegistryEntry () : m_factory (nullptr) {}

        ClassRegistryEntry (const QString & className, CartaObjectFactory * factory)
        : m_className (className), m_factory (factory)
        {}

        QString getClassName () const;
        CartaObjectFactory * getFactory () const {
            return m_factory;
        }

    private:

        QString m_className;
        CartaObjectFactory * m_factory;
    };

    /// stores a tuple<QString, QString, QString, CartaObject>
    class ObjectRegistryEntry {

    public:

        ObjectRegistryEntry () : m_object(nullptr) {}

        ObjectRegistryEntry (const QString & className,
                const QString & id,
                const QString & path,
                CartaObject * object)
        : m_className (className),
          m_id (id),
          m_object (object),
          m_path (path)
        {}

        const QString & getClassName () const;
        const QString & getId () const;
        CartaObject * getObject () const {
            return m_object;
        }
        const QString & getPath () const;

    private:

        QString m_className;
        QString m_id;
        CartaObject * m_object;
        QString m_path;

    };

    ObjectManager (); // for use of singleton only

    ObjectManager (const ObjectManager & other); // do not implement
    ObjectManager & operator= (const ObjectManager & other); // do not implement

    // Looks up factory information using class name

    typedef std::map <QString, ClassRegistryEntry> ClassRegistry;

    // note m_classes[name].getClassName() == name
    ClassRegistry m_classes;

    const QString m_root;
    const QString m_sep;

    int m_nextId;

    // Looks up existing objects using their ID

    typedef std::map <QString, ObjectRegistryEntry> ObjectRegistry;

    ObjectRegistry m_objects;

};

class ExampleCartaObject : public CartaObject {

public:

    static const QString DoSomething;

    QString doSomething (const QString & command, const QString & parameters,
            const QString & sessionId);


private:

    ExampleCartaObject (const QString & path, const QString & id);

    class Factory : public CartaObjectFactory {

    public:

        CartaObject * create (const QString & path, const QString & id)
        {
            return new ExampleCartaObject (path, id);
        }
    };

    static bool m_registered;

};



#endif /* OBJECTMANAGER_H_ */
