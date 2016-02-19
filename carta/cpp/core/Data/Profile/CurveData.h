/***
 * A set of data that comprises a curve.
 */

#pragma once

#include "State/ObjectManager.h"
#include "State/StateInterface.h"
#include "CartaLib/IImage.h"
#include <QColor>
#include <QObject>

namespace Carta {
namespace Lib {

namespace Image {
class ImageInterface;
}
}
}

namespace Carta {
namespace Data {

class LineStyles;

class CurveData : public Carta::State::CartaObject {
friend class Profiler;
public:

    /**
     * Return the color to use in plotting the points of the curve.
     * @return - the color to use in plotting the points of the curve.
     */
    QColor getColor() const;

    /**
     * Return an identifier for the curve.
     * @return - a curve identifier.
     */
    QString getName() const;

    /**
     * Return the internal state of the curve as a string.
     * @return - the curve state.
     */
    QString getStateString() const;

    /**
     * Return the image used to generate the curve.
     * @return - the image used to generate the curve.
     */
    std::shared_ptr<Carta::Lib::Image::ImageInterface> getSource() const;

    /**
     * Get the curve x-coordinates.
     * @return - the curve x-coordinate values.
     */
    std::vector<double> getValuesX() const;

    /**
     * Get the curve y-coordinates.
     * @return - the curve y-coordinate values.
     */
    std::vector<double> getValuesY() const;

    /**
     * Set the color to use in plotting the points of the curve.
     * @param color - the color to use in plotting curve points.
     */
    void setColor( QColor color );

    /**
     * Set the x- and y- data values that comprise the curve.
     * @param valsX - the x-coordinate values of the curve.
     * @param valsY - the y-coordinate values of the curve.
     */
    void setData( const std::vector<double>& valsX, const std::vector<double>& valsY  );

    /**
     * Set the line style (outline,solid, etc) for drawing the curve.
     * @param lineStyle - the style to be used for connecting the curve points.
     */
    QString setLineStyle( const QString& lineStyle );

    /**
     * Set an identifier for the curve.
     * @param curveName - an identifier for the curve.
     */
    void setName( const QString& curveName );

    /**
     * Set the image that was used to generate the curve.
     * @param imageSource - the image that was used to generate the curve.
     */
    void setSource( std::shared_ptr<Carta::Lib::Image::ImageInterface> imageSource );

    virtual ~CurveData();
    const static QString CLASS_NAME;

private:

    const static QString COLOR;
    const static QString STYLE;

    void _initializeDefaultState();
    void _initializeStatics();


    void _saveCurve();
    static bool m_registered;
    static LineStyles* m_lineStyles;

    CurveData( const QString& path, const QString& id );
    class Factory;

    std::vector<double> m_plotDataX;
    std::vector<double> m_plotDataY;
    std::shared_ptr<Carta::Lib::Image::ImageInterface> m_imageSource;

	CurveData( const CurveData& other);
	CurveData operator=( const CurveData& other );
};
}
}