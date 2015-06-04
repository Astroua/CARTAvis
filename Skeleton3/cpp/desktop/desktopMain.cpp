/*
 * This is the desktop main
 */

#include "DesktopPlatform.h"
#include "common/Viewer.h"
#include "common/Hacks/HackViewer.h"
#include "common/MyQApp.h"
#include "common/CmdLine.h"
#include "common/MainConfig.h"
#include "common/Globals.h"
#include <QDebug>

///
/// \brief main entry point for desktop viewer
/// \param argc standard argc
/// \param argv standard argv
/// \return standard main return (0=success)
///
/// @todo refactor some of the common code in desktopMain and serverMain into a commonMain
///
/// @warning keep this in sync with serverMain until refactored to commonMain
///
int main(int argc, char ** argv)
{
    //
    // initialize Qt
    //
    MyQApp qapp( argc, argv);

#ifdef QT_DEBUG
    MyQApp::setApplicationName( "Skeleton3-desktop-debug");
#else
    MyQApp::setApplicationName( "Skeleton3-desktop-release");
#endif

    qDebug() << "Starting" << qapp.applicationName() << qapp.applicationVersion();

    // alias globals
    auto & globals = * Globals::instance();

    // parse command line arguments & environment variables
    // ====================================================
    auto cmdLineInfo = CmdLine::parse( MyQApp::arguments());
    globals.setCmdLineInfo( & cmdLineInfo);

    // load the config file
    // ====================
    QString configFilePath = cmdLineInfo.configFilePath();
    auto mainConfig = MainConfig::parse( configFilePath);
    globals.setMainConfig( & mainConfig);
    qDebug() << "plugin directories:\n - " + mainConfig.pluginDirectories().join( "\n - ");

    // initialize platform
    // ===================
    // platform gets command line & main config file via globals
    auto platform = new DesktopPlatform();
    globals.setPlatform( platform);

    // prepare connector
    // =================
    // connector is created via platform, but we put it into globals explicitely here
    IConnector * connector = platform-> connector();
    if( ! connector) {
        qFatal( "Could not initialize connector!");
    }
    globals.setConnector( connector);

    // initialize plugin manager
    // =========================
    globals.setPluginManager( std::make_shared<PluginManager>() );
    auto pm = globals.pluginManager();
    // tell plugin manager where to find plugins
    pm-> setPluginSearchPaths( globals.mainConfig()->pluginDirectories() );
    // find and load plugins
    pm-> loadPlugins();
    qDebug() << "Loading plugins...";
    auto infoList = pm-> getInfoList();
    qDebug() << "List of plugins: [" << infoList.size() << "]";
    for ( const auto & entry : infoList ) {
        qDebug() << "  path:" << entry.json.name;
    }

    // create the viewer
    // =================
    Viewer viewer;
    Hacks::HackViewer::UniquePtr hackViewer = nullptr;
    if( globals.mainConfig()-> hacksEnabled()) {
        hackViewer.reset( new Hacks::HackViewer);
    }
    if ( globals.mainConfig()->isDeveloperLayout()){
        viewer.setDeveloperView();
    }

    // prepare closure to execute when connector is initialized
    IConnector::InitializeCallback initCB = [&](bool valid) -> void {
        if( ! valid) {
            qFatal( "Could not initialize connector");
        }
        viewer.start();
        if( hackViewer) {
            hackViewer-> start();
        }
    };

    // initialize connector
    connector-> initialize( initCB);

    // qt now has control
    return qapp.exec();
}

