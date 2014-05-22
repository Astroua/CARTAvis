/**
 *
 **/


#include "PluginManager.h"

#include <QDirIterator>
#include <QImage>
#include <QPluginLoader>
#include <QLibrary>
#include <QtGlobal>

PluginManager::PluginManager()
{
    QString env = qgetenv( "LD_LIBRARY_PATH");
     env = "";
     QStringList envList = env.split( ":", QString::SkipEmptyParts);
     envList.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib");
     envList.append( "/home/pfederl/Software/cfitsio3360shared/lib");
     env = envList.join( ":");
     qputenv( "LD_LIBRARY_PATH", env.toLocal8Bit());
     qDebug() << "setting LD_LIBRARY_PATH:" << env.toLocal8Bit();
     qDebug() << "LD_LIBRARY_PATH = " << qgetenv( "LD_LIBRARY_PATH");

     QStringList libs;
     libs.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib/libcasa_casa.so");
     libs.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib/libcasa_scimath_f.so");
     libs.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib/libcasa_scimath.so");
     libs.append( "/home/pfederl/Software/cfitsio3360shared/lib/libcfitsio.so");
     libs.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib/libcasa_tables.so");
     libs.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib/libcasa_measures.so");
     libs.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib/libcasa_fits.so");
     libs.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib/libcasa_coordinates.so");
     libs.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib/libcasa_components.so");
     libs.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib/libcasa_mirlib.so");
     libs.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib/libcasa_lattices.so");
     libs.append( "/home/pfederl/Software/casacore-1.5.0-shared/lib/libcasa_images.so");

     for( auto fname : libs) {
         qDebug() << "loading " << fname;
         QLibrary lib( fname);
         if( ! lib.load()) {
             qDebug() << " error:" << lib.errorString();
         }
         else {
             qDebug() << " success";
         }

     }



}


void PluginManager::loadPlugins()
{

    // first handle staticly linked plugins (if any)
    foreach (QObject *plugin, QPluginLoader::staticInstances()) {
        processPlugin(plugin);
    }

    // now load user installed plugins
    QDir dir = QDir::currentPath();
    QDirIterator dit( dir.absolutePath(), QDirIterator::Subdirectories | QDirIterator::FollowSymlinks);
    while (dit.hasNext()) {
        dit.next();
        if( ! dit.fileInfo().isFile()) continue;
        if( ! dit.fileInfo().fileName().endsWith( ".so")) continue;
        auto absoluteFilePath = dit.fileInfo().absoluteFilePath();
        qDebug() << "trying " << absoluteFilePath;
        QPluginLoader loader( absoluteFilePath);
        QObject * plugin = loader.instance();
        if( plugin) {
            processPlugin( plugin, absoluteFilePath);
        } else {
            qDebug() << "QPluginLoader error = " << loader.errorString();
            // QPluginLoader is not very verbose with error messages, so let's see
            // if we can get QLibrary get us more detailed message
            QLibrary lib( absoluteFilePath);
            if( ! lib.load()) {
                qDebug() << "QLibrary error:" << lib.errorString();
            } else {
                qDebug() << "QLibrary loaded the file fine";
            }

        }
    }

}

void PluginManager::processPlugin(QObject *plugin, QString path)
{
    IPlugin * cartaPlugin = qobject_cast<IPlugin *>( plugin);
    if( ! cartaPlugin) {
        // not a carta plugin, ignore it
        qDebug() << "not a carta plugin";
        return;
    }

    qDebug() << "yup, a carta plugin";

    // add info about this plugin to our list
    PluginInfo * info = new PluginInfo;
    info-> rawPlugin = cartaPlugin;
    info-> path = path;
    m_allPlugins.push_back( info);

    // find out what hooks this plugin wants to listen to
    auto hooks = cartaPlugin->getInitialHookList();
    for( auto id : hooks) {
        m_hook2plugin[id].push_back( info);
        qDebug() << "adding pluginInfo ptr " << info;
    }



}

void fakeMain()
{
    PluginManager pm;

    QString filename = "file.json";
    QImage testImage;

    // configure the manager from a filename
    // JSON or INI format?
    pm.loadConfig( filename);

    // load all plugins
    pm.loadPlugins();

    // execute a hook that calls all plugins, with some parameters, and a return type
    // the result is an array of the results
//    std::vector<QImage> images = pm.hookAll<Render>(8, "Hello", testImage);

    // get info about all plugins
    const std::vector<PluginManager::PluginInfo *> & infoList = pm.getInfoList();
    for( const auto & entry : infoList) {
        // print out info about each plugin
        // ...
        []( decltype(entry) ) {};
    }

    // execute a hook that calls all plugins, with no parameters and no return type
    pm.prepare<Initialize>();

    // execute a hook that calls all plugins, with some parameters and no return type
//    pm.hookAll<Render>( 8, "Hello", testImage);

    // execute a hook that calls first plugin that answers and returns the result
//    auto res2 = pm.hookFirst<GetRandomNumber>();

    // execute a hook with some parameters and a result, and execute a closure
    // for each result
    auto helper = pm.prepare<PreRender>( "Test", & testImage);
    helper.forEachCond( [] (PreRender::ResultType) -> bool { return true; });

//    pm.hookAll2<Render>( 3, "Test", testImage).forEach(
//                [] ( const Render::ResultType & )
//                );



}




