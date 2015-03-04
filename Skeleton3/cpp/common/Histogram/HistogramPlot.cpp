#include "Histogram/HistogramPlot.h"
#include "../Data/Histogram.h"
#include <qwt_painter.h>
#include "CartaLib/PixelPipeline/IPixelPipeline.h"

namespace Carta {
namespace Histogram {


HistogramPlot::HistogramPlot():
    m_defaultColor( "#6699CC" ),
    m_brush( m_defaultColor ){
    setStyle(QwtPlotHistogram::Columns);
    m_drawStyle = Carta::Data::Histogram::GRAPH_STYLE_LINE;
    m_colored = true;
}
void HistogramPlot::setColorMap( std::shared_ptr<Carta::Lib::PixelPipeline::IColormapNamed> cMap ){
    m_colorMap = cMap;
}

void HistogramPlot::setColored( bool colored ){
    m_colored = colored;
}

void HistogramPlot::setData (const QVector< QwtIntervalSample > & data ){
    QwtPlotHistogram::setSamples( data );
    m_data = data;
}

void HistogramPlot::setDrawStyle( const QString& style ){
    m_drawStyle = style;
}


void HistogramPlot::drawColumn (QPainter * painter, const QwtColumnRect & rect,
        const QwtIntervalSample & sample) const{
    QBrush brush( m_defaultColor );
    if ( !m_colored ){
        painter->setPen( m_defaultColor);
    }
    else {
        QwtInterval xRange = sample.interval;
        double midPt = (xRange.minValue() + xRange.maxValue()) / 2;
        std::array<double,3> normRGB;
        m_colorMap->convert( midPt, normRGB );
        QColor sampleColor;
        if ( normRGB[0] >= 0 && normRGB[1] >= 0 && normRGB[2] >= 0 ){
            sampleColor.setRgbF(normRGB[0], normRGB[1], normRGB[2]);
        }
        painter->setPen( sampleColor );
        brush.setColor( sampleColor );
    }
    painter->setBrush( brush );
    QRectF r = rect.toRect();
    if ( QwtPainter::roundingAlignment( painter ) ){
        r.setLeft( qRound( r.left() ) );
        r.setRight( qRound( r.right() ) );
        r.setTop( qRound( r.top() ) );
        r.setBottom( qRound( r.bottom() ) );
    }
    if ( m_drawStyle == Carta::Data::Histogram::GRAPH_STYLE_FILL ){
        QwtPainter::fillRect( painter, r, brush );
    }
    else if ( m_drawStyle == Carta::Data::Histogram::GRAPH_STYLE_LINE ){
        double middle = ( r.left() + r.right() ) / 2;
        QwtPainter::drawLine( painter, middle, r.bottom(), middle, r.top() );
    }
    else if ( m_drawStyle == Carta::Data::Histogram::GRAPH_STYLE_OUTLINE ){
        //Draw the top
        double top = r.top();
        double right = r.right();
        QwtPainter::drawLine( painter, r.left(), top, r.right(), top );
        //Draw the left vertical line
        QwtPainter::drawLine( painter, r.left(), m_lastY, r.left(), top );
        //Store the top for the next call.
        if ( top > 0 ){
            m_lastY = top;
        }
        if ( right > 0 ){
            m_lastX = right;
        }
    }
    else {
        qCritical() << "Unrecognized draw style="<< m_drawStyle;
    }
}
void HistogramPlot::drawSeries( QPainter *painter, const QwtScaleMap &xMap,
                const QwtScaleMap &yMap, const QRectF & rect, int from, int to ) const {
    if ( !painter || m_data.size() <= 0 ){
        return;
    }
    if ( to < 0 ){
        to= m_data.size() - 1;
    }
    m_lastY = rect.bottom();
    m_lastX = rect.left();
    drawColumns( painter, xMap, yMap, from, to );
    if ( m_drawStyle == Carta::Data::Histogram::GRAPH_STYLE_OUTLINE ){
        QwtPainter::drawLine( painter, m_lastX, m_lastY, m_lastX, rect.bottom());
    }
}


HistogramPlot::~HistogramPlot(){

}

}
}
	
