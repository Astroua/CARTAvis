/**
 * Represents a user selection on a histogram (shaded region).
 */
#pragma once
#include <qwt_plot_marker.h>

class QPainter;

namespace Carta {
namespace Plot2D {


class Plot2DSelection : public QwtPlotMarker{
public:
    /**
     * Constructor.
     */
	Plot2DSelection();

	/**
     * Draw the range.
     * @param painter
     * @param xMap
     * @param yMap
     * @param canvasRect
     */
    virtual void draw ( QPainter* painter, const QwtScaleMap& xMap,
        const QwtScaleMap& yMap, const QRectF& canvasRect) const;


	/**
	 * Returns the lower bound of the range.
	 */
	int getLowerBound() const;

	/**
	 * Returns the upper bound of the range.
	 */
	int getUpperBound() const;

	/**
	 * Returns the lower clip of the histogram.
	 */
	double getClipMin() const;

	/**
	 * Returns the upper clip of the histogram.
	 */
	double getClipMax() const;

	/**
     * Set the range back to a single line.
     */
    void reset();

	/**
	 * Set the min and max values (pixels) of the range.
	 * @param minX the minimum pixel value of the range.
	 * @param maxX the maximum pixel value of the range.
	 */
	void setBoundaryValues( double minX, double maxX );

	/**
	 * Set the minimum and maximum (intensity) of the range.
	 * @param minX the minimum intensity value of the range.
	 * @param maxX the maximum intensity value of the range.
	 */
	void setClipValues( double minX, double maxX );

	/**
	 * Set the color used to shade the clip region.
	 * @param color the shade color for the clip region.
	 */
	void setColoredShade( QColor color );

	/**
     * Set the height of the range.
     */
    void setHeight( int h );

	/**
	 * Set whether or not the user is currently selecting a range.
	 * @param drawing true if the user is selecting a range; false otherwise.
	 */
	void setSelectionMode(bool drawing);

	/**
	 * Destructor.
	 */
	virtual ~Plot2DSelection();

private:
	Plot2DSelection( const Plot2DSelection& );
	Plot2DSelection& operator=( const Plot2DSelection& );
	int m_height;
	double m_lowerBound;
	double m_upperBound;
	bool rangeSet;
	bool m_selection;
	QColor m_shadeColor;
	mutable double m_clipMin;
	mutable double m_clipMax;

};

}
}


