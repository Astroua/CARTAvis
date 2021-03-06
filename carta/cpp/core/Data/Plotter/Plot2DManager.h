/***
 * Provides the glue between an ImageView, displaying a plot, and
 * an application class which provides data to the plot and sets
 * plot properties.
 */

#pragma once

#include "State/ObjectManager.h"
#include "State/StateInterface.h"
#include "CartaLib/Hooks/Histogram.h"
#include "CartaLib/Hooks/Plot2DResult.h"
#include <QObject>

namespace Carta {

namespace Lib {
namespace PixelPipeline {
class CustomizablePixelPipeline;
}
}
}

class ImageView;

namespace Carta {
namespace Plot2D {
class Plot2DGenerator;
}

namespace Data {


class Plot2DManager : public QObject, public Carta::State::CartaObject {

    Q_OBJECT

public:

    /**
     * Constructor.
     * @param path - a base path identifier.
     * @param id - an object specific identifier.
     */
    //Note:  This class is a CartaObject to make it easy to add callbacks & receive
    //events.  However, it does not have state that needs to be persisted, so it has
    //a public constructor.  The path and id passed in are that of the application
    //class.
    Plot2DManager( const QString& path, const QString& id );

    /**
     * Add data to the plot.
     * @param data - a list of (x,y)-values for the plot.
     */
    void addData( const Carta::Lib::Hooks::Plot2DResult* data);

    /**
     * Remove all data from the plot.
     */
    void clearData();

    /**
     * Clear the zoom selection.
     */
    void clearSelection();

    /**
     * Clear the secondary selection.
     */
    void clearSelectionColor();

    /**
     * End the zoom selection.
     * @param params - the x-coordinate where the selection ended.
     */
    void endSelection(const QString& params );

    /**
     * End the secondary selection.
     * @param params - the x-coordinate where the selection ended.
     */
    void endSelectionColor(const QString& params );

    /**
     * Get the label for the y-axis.
     * @return - the label for the y-axis.
     */
    QString getAxisUnitsY() const;



    /**
     * Get the title of the plot.
     * @return - the plot title.
     */
    QString getPlotTitle() const;

    /**
     * Get the range for the y-axis (min, max) value.
     * @param valid - true if the bounds are valid; false if they are invalid,
     *      for example, if there is no data on the plot.
     * @return - the plot minimum and maximum y-value.
     */
    std::pair<double,double> getPlotBoundsY( const QString& id, bool* valid ) const;

    /**
     * Get the min and max of the zoom selection.
     * @param valid - set to true if there is a valid zoom selection;
     *      false otherwise.
     * @return - the range of the zoom selections.
     */
    std::pair<double,double> getRange( bool* valid ) const;

    /**
     * Get the min and max of the secondary selection.
     * @param valid - set to true if there is a valid zoom selection;
     *      false otherwise.
     * @return - the range of the secondary selections.
     */
    std::pair<double,double> getRangeColor( bool* valid ) const;

    /**
     * Return the current position of the vertical line marker in world coordinates.
     * @param valid - set to true, if the vertical line has a valid position with
     *      respect to a data set; otherwise, false.
     * @return - the position of the vertical line marker in world coordinates.
     */
    double getVLinePosition( bool* valid ) const;

    /**
     * Remove a profile from the list.
     * @param dataName - the profile to remove.
     */
    void removeData( const QString& dataName );

    /**
     * Save a copy of the plot as an image.
     * @param filename the full path where the file is to be saved.
     * @return an error message if there was a problem saving the Plot2DManager;
     *      an empty string otherwise.
     */
    QString savePlot( const QString& filename );

    /**
     * Set a range of values for the x-axis.
     * @param min - the minimum x-value.
     * @param max - the maximum x-value.
     */
    void setAxisXRange( double min, double max );

    /**
     * Set the color of a specific set of data on the plot.
     * @param curveColor - the color of a specific plot data set.
     * @param id - an identifier for a particular data set.
     */
    //Note:  this refers to using a single color for the entire data set.
    void setColor( QColor curveColor, const QString& id = QString() );

    /**
     * Set whether or not the graph should be colored.
     * @param colored - true if the graph should be colored; false otherwise.
     */
    //Note:  this refers to a multicolored data set.
    void setColored( bool colored, const QString& id = QString() );

    /**
     * Set the text giving coordinate information for points on the plot.
     * @param cursorText - set the text that gives coordinate information for points on
     *      the plot.
     */
    void setCursorText( const QString& cursorText );

    /**
     * Rename the curve.
     * @param oldName - the original name of the curve.
     * @param newName - the new name for the curve.
     */
    void setCurveName( const QString& oldName, const QString& newName );

    /**
     * Set whether or not to show/hide grid lines.
     * @param showGrid - true to show grid lines on the plot canvas; false otherwise.
     */
    void setGridLines( bool showGrid );

    /**
     * Set whether or not to show a line with legend items.
     * @param showLegendLine - true if a sample line should be shown with legend
     *      items; false, otherwise.
     */
    void setLegendLine( bool showLegendLine );

    /**
     * Set the location of the legend on the plot.
     * @param location - an identifier for a location on the plot where the
     *      legend should appear.
     */
    void setLegendLocation( const QString& location );

    /**
     * Set whether the legend should be external or internal to the plot.
     * @param externalLegend - true for a legend external to the plot; false for
     *      a legend internal to the plot.
     */
    void setLegendExternal( bool externalLegend );

    /**
     * Set whether or not the legend should be shown on the plot.
     * @param showLegend - true if the legend should be shown on the plot; false,
     *      otherwise.
     */
    void setLegendShow( bool showLegend );

    /**
     * Set the line style to use for data sets (outline, dashed,solid,etc).
     * @param style - an identifier for the line style.
     * @param id - an identifier for the data set that should use the style
     *  or an empty string if all data sets should use the style.
     */
    void setLineStyle( const QString& style, const QString& id = QString() );

    /**
     * Set whether or not the y-axis of the plot should use a log scale.
     * @param logScale - true if a log scale should be used; false otherwise.
     */
    void setLogScale( bool logScale );

    /**
     * Set information for coloring the plot.
     * @param pipeline - information about how the data should be colored.
     */
    void setPipeline( std::shared_ptr<Carta::Lib::PixelPipeline::CustomizablePixelPipeline> pipeline);

    /**
     * Set the type of data that will be generated for the plot.
     * @param gen - the generator for the plot data.
     */
    void setPlotGenerator( Carta::Plot2D::Plot2DGenerator* gen );

    /**
     * Set the zoom range for the plot.
     * @param min - the minimum zoom value.
     * @param max - the maximum zoom value.
     */
    void setRange( double min, double max );

    /**
     * Set the secondary selection range for the plot.
     * @param min - the lower boundary of the secondary selection.
     * @param max - the upper boundary of the secondary selection.
     */
    void setRangeColor( double min, double max );

    /**
     * Set the line/fill style for the plot.
     * @param styleName - a plot style identifier.
     */
    void setStyle( const QString& styleName, const QString& id = QString() );

    /**
     * Set the label for the x-axis.
     * @param title - the label for the x-axis.
     */
    void setTitleAxisX( const QString& title );

    /**
     * Set the label for the y-axis.
     * @param title - the label for the y-axis.
     */
    void setTitleAxisY( const QString& title );

    /**
     * Set the location of the plot vertical line using a world
     * x-coordinate.
     * @param xPos - the x-coordinate of the plot vertical line in
     *  world units.
     */
    void setVLinePosition( double xPos );

    /**
     * Start a zoom selection.
     * @param params - the x-value where the selection should start.
     */
    void startSelection(const QString& params );

    /**
     * Start a secondary plot selection.
     * @param params - the x-value where the selection should start.
     */
    void startSelectionColor( const QString& params );

    /**
     * Update the plot graph.
     */
    void updatePlot( );

    /**
     * Update a user selection.
     * @param x - the current x-coordinate end value of the selection.
     * @param y - the current y-coordinate end value of the selection.
     * @param width - the width of the screen.
     * @param height - the height of the screen.
     */
    void updateSelection(int x, int y, int width, int height );

    virtual ~Plot2DManager();

    const static QString CLASS_NAME;
    const static QString CURSOR_TEXT;
    const static QString GRAPH_STYLE_LINE;
    const static QString GRAPH_STYLE_OUTLINE;
    const static QString GRAPH_STYLE_FILL;

signals:

    /**
     * Notification that the mouse has moved on the plot.
     * @param x - the x-coordinate of the plot point.
     * @param y - the y-coordinate of the plot point.
     */
    void cursorMove( double x, double y );

    /**
     * Notification to the application class that the user has made
     * a selection through the GUI.
     */
    void userSelection();

    /**
     * Notification to the application class that the user has made
     * a secondary selection through the GUI.
     */
    void userSelectionColor();

private slots:

    /**
     * Update the size of the plot.
     * @param size - the new size of the plot in pixels.
     */
    void _updateSize( const QSize& size );

private:

    const static QString DATA_PATH;

    void _initializeDefaultState();
    void _initializeCallbacks();

    void _refreshView();

    void  _updateColorSelection();

    bool m_selectionEnabled;
    double m_selectionStart;
    double m_selectionEnd;
    bool m_selectionEnabledColor;
    bool m_cursorEnabled;

    //View of plot
    std::shared_ptr<ImageView> m_view = nullptr;


    Carta::Plot2D::Plot2DGenerator* m_plotGenerator;

    //Separate state for mouse events since they get updated rapidly and not
    //everyone wants to listen to them.
    Carta::State::StateInterface m_stateMouse;
	Plot2DManager( const Plot2DManager& other);
	Plot2DManager& operator=( const Plot2DManager& other );
};
}
}
