! include(../common.pri) {
  error( "Could not find the common.pri file!" )
}

TEMPLATE = lib

###CONFIG += staticlib
QT += widgets network
QT += xml

HEADERS += \
    IConnector.h \
    IPlatform.h \
    Viewer.h \
    IView.h \
    MyQApp.h \
    CallbackList.h \
    PluginManager.h \
    Globals.h \
    Algorithms/Graphs/TopoSort.h \
    stable.h \
    CmdLine.h \
    MainConfig.h \
    State/ObjectManager.h \
    State/StateInterface.h \
    State/UtilState.h \
    ImageView.h \
    Data/Animator/Animator.h \
    Data/Animator/AnimatorType.h \
    Data/Animator/AnimationTypes.h \
    Data/Clips.h \
    Data/Colormap/Colormap.h \
    Data/Colormap/Colormaps.h \
    Data/Colormap/TransformsData.h \
    Data/Colormap/TransformsImage.h \
    Data/DataLoader.h \
    Data/Error/ErrorReport.h \
    Data/Error/ErrorManager.h \
    Data/Histogram/Histogram.h \
    Data/Histogram/ChannelUnits.h \
    Data/IColoredView.h \
    Data/ILinkable.h \
    Data/Settings.h \
    Data/Image/Controller.h \
    Data/Image/CoordinateSystems.h \
    Data/Image/DataGrid.h \
    Data/Image/DataSource.h \
    Data/Image/Fonts.h \
    Data/Image/GridControls.h \
    Data/Image/ImageGridServiceSynchronizer.h \
    Data/Image/Themes.h \
    Data/Selection.h \
    Data/Layout/Layout.h \
    Data/Layout/LayoutNode.h \
    Data/Layout/LayoutNodeComposite.h \
    Data/Layout/LayoutNodeLeaf.h \
    Data/Layout/NodeFactory.h \
    Data/LinkableImpl.h \
    Data/Preferences/Preferences.h \
    Data/Preferences/PreferencesSave.h \
    Data/Region.h \
    Data/Region.h \
    Data/RegionRectangle.h \
    Data/Snapshot/ISnapshotsImplementation.h \
    Data/Snapshot/Snapshots.h \
    Data/Snapshot/Snapshot.h \
    Data/Snapshot/SnapshotsFile.h \
    Data/Statistics.h \
    Data/Util.h \
    GrayColormap.h \
    Data/ViewManager.h \
    Data/ViewPlugins.h \
    GrayColormap.h \
    ImageRenderService.h \
    ImageSaveService.h \
    Histogram/HistogramGenerator.h \
    Histogram/HistogramSelection.h \
    Histogram/HistogramPlot.h \
    ScriptedClient/ScriptedCommandListener.h \
    ScriptedClient/ScriptFacade.h \
    Algorithms/quantileAlgorithms.h \
    ScriptedClient/Listener.h \
    ScriptedClient/ScriptedCommandInterpreter.h \
    ScriptedClient/VarLengthMessage.h \
    ScriptedClient/TagMessage.h \
    ScriptedClient/JsonMessage.h \
    DefaultContourGeneratorService.h \
    Hacks/HackViewer.h \
    Hacks/ImageViewController.h \
    Hacks/MainModel.h \
    Hacks/ILayeredView.h \
    Hacks/IVectorGraphicsView.h \
    Hacks/WcsGridOptionsController.h \
    Hacks/SharedState.h \
    Hacks/ContourEditorController.h \
    VGView.h \
    DummyGridRenderer.h \
    coreMain.h \
    SimpleRemoteVGView.h \
    Hacks/ManagedLayerView.h

SOURCES += \
    Viewer.cpp \
    MyQApp.cpp \
    CallbackList.cpp \
    PluginManager.cpp \
    Globals.cpp \
    Algorithms/Graphs/TopoSort.cpp \
    CmdLine.cpp \
    MainConfig.cpp \
    State/ObjectManager.cpp\
    State/StateInterface.cpp \
    State/UtilState.cpp \
    ImageView.cpp \
    Data/Settings.cpp \
    Data/Animator/Animator.cpp \
    Data/Animator/AnimatorType.cpp \
    Data/Animator/AnimationTypes.cpp \
    Data/Clips.cpp \
    Data/Colormap/Colormap.cpp \
    Data/Colormap/Colormaps.cpp \
    Data/Colormap/TransformsData.cpp \
    Data/Colormap/TransformsImage.cpp \
    Data/Image/Controller.cpp \
    Data/Image/CoordinateSystems.cpp \
    Data/Image/DataGrid.cpp \
    Data/Image/DataSource.cpp \
    Data/Image/Fonts.cpp \
    Data/Image/GridControls.cpp \
    Data/Image/ImageGridServiceSynchronizer.cpp \
    Data/Image/Themes.cpp \
    Data/DataLoader.cpp \
    Data/Error/ErrorReport.cpp \
    Data/Error/ErrorManager.cpp \
    Data/Histogram/Histogram.cpp \
    Data/Histogram/ChannelUnits.cpp \
    Data/LinkableImpl.cpp \
    Data/Selection.cpp \
    Data/Layout/Layout.cpp \
    Data/Layout/LayoutNode.cpp \
    Data/Layout/LayoutNodeComposite.cpp \
    Data/Layout/LayoutNodeLeaf.cpp \
    Data/Layout/NodeFactory.cpp \
    Data/Preferences/Preferences.cpp \
    Data/Preferences/PreferencesSave.cpp \
    Data/Region.cpp \
    Data/RegionRectangle.cpp \
    Data/Snapshot/Snapshots.cpp \
    Data/Snapshot/Snapshot.cpp \
    Data/Snapshot/SnapshotsFile.cpp \
    Data/Statistics.cpp \
    Data/Util.cpp \
    Data/ViewManager.cpp \
    Data/ViewPlugins.cpp \
    GrayColormap.cpp \
    Histogram/HistogramGenerator.cpp \
    Histogram/HistogramSelection.cpp \
    Histogram/HistogramPlot.cpp \
    ScriptedClient/ScriptedCommandListener.cpp \
    ScriptedClient/ScriptFacade.cpp \
    ImageRenderService.cpp \
    ImageSaveService.cpp \
    Algorithms/quantileAlgorithms.cpp \
    ScriptedClient/Listener.cpp \
    ScriptedClient/ScriptedCommandInterpreter.cpp \
    ScriptedClient/VarLengthMessage.cpp \
    ScriptedClient/TagMessage.cpp \
    ScriptedClient/JsonMessage.cpp \
    DefaultContourGeneratorService.cpp \
    Hacks/HackViewer.cpp \
    Hacks/ImageViewController.cpp \
    Hacks/MainModel.cpp \
    Hacks/ILayeredView.cpp \
    Hacks/IVectorGraphicsView.cpp \
    Hacks/WcsGridOptionsController.cpp \
    Hacks/SharedState.cpp \
    Hacks/ContourEditorController.cpp \
    VGView.cpp \
    DummyGridRenderer.cpp \
    coreMain.cpp \
    SimpleRemoteVGView.cpp \
    Hacks/ManagedLayerView.cpp


#message( "common            PWD=$$PWD")
#message( "common         IN_PWD=$$IN_PWD")
#message( "common _PRO_FILE_PWD_=$$_PRO_FILE_PWD_")
#message( "common        OUT_PWD=$$OUT_PWD")

#CONFIG += precompile_header
#PRECOMPILED_HEADER = stable.h
#QMAKE_CXXFLAGS += -H

INCLUDEPATH += $$absolute_path(../../../ThirdParty/rapidjson/include)

#INCLUDEPATH += ../../../ThirdParty/qwt/include
#LIBS += -L../../../ThirdParty/qwt/lib -lqwt

QWT_ROOT = $$absolute_path("../../../ThirdParty/qwt")
INCLUDEPATH += $$QWT_ROOT/include
unix:macx {
	QMAKE_LFLAGS += '-F$$QWT_ROOT/lib'
	LIBS +=-L../CartaLib -lCartaLib -framework qwt
}
else {
	QMAKE_LFLAGS += '-Wl,-rpath,\'$$QWT_ROOT/lib\''
	LIBS +=-L../CartaLib -lCartaLib -L$$QWT_ROOT/lib -lqwt
}

DEPENDPATH += $$PROJECT_ROOT/CartaLib
