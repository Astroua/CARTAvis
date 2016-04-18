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
    Data/Clips.h \
    Data/Colormap/Colormap.h \
    Data/Colormap/Colormaps.h \
    Data/Colormap/ColorState.h \
    Data/Colormap/TransformsData.h \
    Data/Colormap/TransformsImage.h \
    Data/DataLoader.h \
    Data/Error/ErrorReport.h \
    Data/Error/ErrorManager.h \
    Data/Histogram/Histogram.h \
    Data/Histogram/ChannelUnits.h \
    Data/Histogram/HistogramRenderService.h \
    Data/Histogram/HistogramRenderThread.h \
    Data/Histogram/HistogramRenderWorker.h \
    Data/ILinkable.h \
    Data/Settings.h \
    Data/Image/Controller.h \
    Data/Image/LayerGroup.h \
    Data/Image/Stack.h \
    Data/Image/Layer.h \
    Data/Image/LayerData.h \
    Data/Image/Contour/Contour.h \
    Data/Image/Contour/ContourControls.h \
    Data/Image/Contour/ContourGenerateModes.h \
    Data/Image/Contour/ContourSpacingModes.h \
    Data/Image/Contour/ContourStyles.h \
    Data/Image/Contour/DataContours.h \
    Data/Image/Contour/GeneratorState.h \
    Data/Image/CoordinateSystems.h \
    Data/Image/DataSource.h \
    Data/Image/Draw/DrawGroupSynchronizer.h \
    Data/Image/Draw/DrawSynchronizer.h \
    Data/Image/Draw/DrawStackSynchronizer.h \
    Data/Image/Grid/AxisMapper.h \
    Data/Image/Grid/DataGrid.h \
    Data/Image/Grid/Fonts.h \
    Data/Image/Grid/GridControls.h \
    Data/Image/Grid/Themes.h \
    Data/Image/Grid/LabelFormats.h \
    Data/Image/IPercentIntensityMap.h \
    Data/Image/LayerCompositionModes.h \
    Data/Image/Save/SaveService.h \
    Data/Image/Save/SaveView.h \
    Data/Image/Save/SaveViewLayered.h \
    Data/Selection.h \
    Data/Layout/Layout.h \
    Data/Layout/LayoutNode.h \
    Data/Layout/LayoutNodeComposite.h \
    Data/Layout/LayoutNodeLeaf.h \
    Data/Layout/NodeFactory.h \
    Data/LinkableImpl.h \
    Data/Plotter/Plot2DManager.h \
    Data/Plotter/PlotStyles.h \
    Data/Plotter/LineStyles.h \
    Data/Plotter/LegendLocations.h \
    Data/Preferences/Preferences.h \
    Data/Preferences/PreferencesSave.h \
    Data/Profile/CurveData.h \
    Data/Profile/IntensityUnits.h \
    Data/Profile/Profiler.h \
    Data/Profile/ProfileStatistics.h \
    Data/Profile/SpectralUnits.h \
    Data/Profile/GenerateModes.h \
    Data/Region/Region.h \
    Data/Region/RegionFactory.h \
    Data/Snapshot/ISnapshotsImplementation.h \
    Data/Snapshot/Snapshots.h \
    Data/Snapshot/Snapshot.h \
    Data/Snapshot/SnapshotsFile.h \
    Data/Statistics/Statistics.h \
    Data/Util.h \
    Data/ViewManager.h \
    Data/ViewPlugins.h \
    GrayColormap.h \
    ImageRenderService.h \
    ImageSaveService.h \
    Plot2D/Plot.h \
    Plot2D/Plot2DGenerator.h \
    Plot2D/Plot2DSelection.h \
    Plot2D/Plot2D.h \
    Plot2D/Plot2DLine.h \
    Plot2D/Plot2DHistogram.h \
    Plot2D/Plot2DProfile.h \
    ProfileExtractor.h \
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
    DummyGridRenderer.h \
    coreMain.h \
    SimpleRemoteVGView.h \
    Hacks/ManagedLayerView.h \
    Hacks/LayeredViewDemo.h

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
    Data/Clips.cpp \
    Data/Colormap/Colormap.cpp \
    Data/Colormap/Colormaps.cpp \
    Data/Colormap/ColorState.cpp \
    Data/Colormap/TransformsData.cpp \
    Data/Colormap/TransformsImage.cpp \
    Data/Image/Controller.cpp \
    Data/Image/LayerData.cpp \
    Data/Image/Layer.cpp \
    Data/Image/LayerGroup.cpp \
    Data/Image/Stack.cpp \
    Data/Image/Contour/Contour.cpp \
    Data/Image/Contour/ContourControls.cpp \
    Data/Image/Contour/ContourGenerateModes.cpp \
    Data/Image/Contour/ContourSpacingModes.cpp \
    Data/Image/Contour/ContourStyles.cpp \
    Data/Image/Contour/DataContours.cpp \
    Data/Image/Contour/GeneratorState.cpp \
    Data/Image/CoordinateSystems.cpp \
    Data/Image/DataSource.cpp \
    Data/Image/Grid/AxisMapper.cpp \
    Data/Image/Grid/DataGrid.cpp \
    Data/Image/Grid/Fonts.cpp \
    Data/Image/Grid/GridControls.cpp \
    Data/Image/Grid/LabelFormats.cpp \
    Data/Image/Grid/Themes.cpp \
    Data/Image/Draw/DrawGroupSynchronizer.cpp \
    Data/Image/Draw/DrawSynchronizer.cpp \
    Data/Image/Draw/DrawStackSynchronizer.cpp \
    Data/Image/LayerCompositionModes.cpp \
    Data/Image/Save/SaveService.cpp \
    Data/Image/Save/SaveView.cpp \
    Data/Image/Save/SaveViewLayered.cpp \
    Data/DataLoader.cpp \
    Data/Error/ErrorReport.cpp \
    Data/Error/ErrorManager.cpp \
    Data/Histogram/Histogram.cpp \
    Data/Histogram/ChannelUnits.cpp \
    Data/Histogram/HistogramRenderService.cpp \
    Data/Histogram/HistogramRenderThread.cpp \
    Data/Histogram/HistogramRenderWorker.cpp \
    Data/LinkableImpl.cpp \
    Data/Selection.cpp \
    Data/Layout/Layout.cpp \
    Data/Layout/LayoutNode.cpp \
    Data/Layout/LayoutNodeComposite.cpp \
    Data/Layout/LayoutNodeLeaf.cpp \
    Data/Layout/NodeFactory.cpp \
    Data/Plotter/Plot2DManager.cpp \
    Data/Plotter/LegendLocations.cpp \
    Data/Plotter/PlotStyles.cpp \
    Data/Plotter/LineStyles.cpp \
    Data/Preferences/Preferences.cpp \
    Data/Preferences/PreferencesSave.cpp \
    Data/Profile/CurveData.cpp \
    Data/Profile/IntensityUnits.cpp \
    Data/Profile/Profiler.cpp \
    Data/Profile/ProfileStatistics.cpp \
    Data/Profile/SpectralUnits.cpp \
    Data/Profile/GenerateModes.cpp \
    Data/Region/Region.cpp \
    Data/Region/RegionFactory.cpp \
    Data/Snapshot/Snapshots.cpp \
    Data/Snapshot/Snapshot.cpp \
    Data/Snapshot/SnapshotsFile.cpp \
    Data/Statistics/Statistics.cpp \
    Data/Util.cpp \
    Data/ViewManager.cpp \
    Data/ViewPlugins.cpp \
    GrayColormap.cpp \
    Plot2D/Plot.cpp \
    Plot2D/Plot2DGenerator.cpp \
    Plot2D/Plot2D.cpp \
    Plot2D/Plot2DLine.cpp \
    Plot2D/Plot2DHistogram.cpp \
    Plot2D/Plot2DProfile.cpp \
    Plot2D/Plot2DSelection.cpp \
    ProfileExtractor.cpp \
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
    DummyGridRenderer.cpp \
    coreMain.cpp \
    SimpleRemoteVGView.cpp \
    Hacks/ManagedLayerView.cpp \
    Hacks/LayeredViewDemo.cpp


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
