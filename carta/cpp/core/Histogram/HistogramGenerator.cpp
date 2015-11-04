#include "../Histogram/HistogramGenerator.h"
#include "../Histogram/HistogramPlot.h"
#include "../Histogram/HistogramSelection.h"
#include <qwt_scale_engine.h>
#include <qwt_scale_map.h>
#include <QPaintDevice>
#include <QRectF>
#include <QPainter>
#include <qwt_plot_renderer.h>
#include <QImage>
#include <QWidget>
#include <qwt_plot.h>
#include <qwt_plot_canvas.h>
#include <qwt_samples.h>
#include <qwt_scale_widget.h>
#include <qwt_plot_histogram.h>
#include "CartaLib/PixelPipeline/CustomizablePixelPipeline.h"

namespace Carta {
namespace Histogram {


const double HistogramGenerator::EXTRA_RANGE_PERCENT = 0.05;


HistogramGenerator::HistogramGenerator():
    m_font( "Helvetica", 10){
    m_plot = new QwtPlot();
    m_plot->setCanvasBackground( Qt::white );
    m_plot->setAxisAutoScale( QwtPlot::yLeft, false );

    QwtText xTitle( "Intensity()");
    xTitle.setFont( m_font );
    m_plot->setAxisTitle(QwtPlot::xBottom, xTitle );
    QwtScaleWidget* leftWidget = m_plot->axisWidget( QwtPlot::yLeft );
    leftWidget->setFont( m_font );
    leftWidget->setSizePolicy( QSizePolicy::Minimum, QSizePolicy::Expanding);
    QwtScaleWidget* bottomWidget = m_plot->axisWidget( QwtPlot::xBottom );
    bottomWidget->setFont( m_font );

    QWidget* canvas = m_plot->canvas();
    canvas->setSizePolicy( QSizePolicy::Expanding, QSizePolicy::Expanding);

    m_maxCount = 1;

    m_histogram = new HistogramPlot();
    m_histogram->attach(m_plot);
    
    m_height = 335;
    m_width = 335;

    m_range = new HistogramSelection();
    m_range->attach(m_plot);

    m_rangeColor = new HistogramSelection();
    QColor shadeColor( "#CCCC99");
    shadeColor.setAlpha( 100 );
    m_rangeColor->setColoredShade( shadeColor );
    m_rangeColor->attach( m_plot );

    setLogScale( true );
}

void HistogramGenerator::clearSelection(){
    m_range->reset();
    m_plot->replot();
}

void HistogramGenerator::clearSelectionColor(){
    m_rangeColor->reset();
    m_plot->replot();
}

std::pair<double,double> HistogramGenerator::getRange(bool* valid ) const {
    std::pair<double,double> result;
    *valid = false;
    if ( m_range ){
        result.first = m_range->getClipMin();
        result.second = m_range->getClipMax();
        *valid = true;
    }
    return result;
}

std::pair<double,double> HistogramGenerator::getRangeColor(bool* valid ) const {
    std::pair<double,double> result;
    *valid = false;
    if ( m_rangeColor ){
        result.first = m_rangeColor->getClipMin();
        result.second = m_rangeColor->getClipMax();
        *valid = true;
    }
    return result;
}


bool HistogramGenerator::isSelectionOnCanvas( int xPos ) const {
    bool selectionOnCanvas = false;
    if ( xPos >= 0 ){
        //Get the ratio of the canvas margin to the plot width;
        float plotWidth = m_plot->size().width();
        float canvasWidth = m_plot->canvas()->size().width();
        float plotMarginWidthRatio = 1;
        if ( plotWidth > 0 ){
            plotMarginWidthRatio = (plotWidth - canvasWidth) / plotWidth;
        }

        //Get the ratio of xPos to QImage width;
        float posImageWidthRatio = 0;
        if ( m_width > 0 ){
            posImageWidthRatio = xPos / m_width;
        }

        //If the position withen the image ratio is larger than the
        //canvas margin ratio, the point is in the canvas.
        if ( posImageWidthRatio >= plotMarginWidthRatio ){
            selectionOnCanvas = true;
        }
    }
    return selectionOnCanvas;
}

void HistogramGenerator::setColored( bool colored ){
    m_histogram->setColored( colored );
}

void HistogramGenerator::setPipeline( std::shared_ptr<Carta::Lib::PixelPipeline::CustomizablePixelPipeline> pipeline){
    m_histogram->setPipeline( pipeline );
}

void HistogramGenerator::setData(Carta::Lib::Hooks::HistogramResult data){
    QwtText name = data.getName();
    name.setFont( m_font );
    m_plot->setTitle(name);
    QwtText xAxisTitle = "Intensity("+ data.getUnits()+")";
    xAxisTitle.setFont( m_font );
    m_plot->setAxisTitle(QwtPlot::xBottom, xAxisTitle );
    m_logCount = true;


    std::vector<std::pair<double,double>> dataVector = data.getData();

    int dataCount = dataVector.size();
    m_maxCount = -1;
    QVector<QwtIntervalSample> samples;
    for ( int i = 0; i < dataCount-1; i++ ){
        //Only add in nonzero counts
        if ( dataVector[i].second > 0 ){
            QwtIntervalSample sample( dataVector[i].second, dataVector[i].first, dataVector[i+1].first );
            samples.push_back( sample );
            if ( dataVector[i].second > m_maxCount ){
                m_maxCount = dataVector[i].second;
            }
        }
    }

    m_histogram->setData(samples);
    m_plot->replot();

}

void HistogramGenerator::_setVerticalAxisTitle(){
    QwtText yTitle("Count(pixels)");
    if ( m_logCount ){
        yTitle.setText("Log Count(pixels)");
    }
    yTitle.setFont( m_font );
    m_plot->setAxisTitle(QwtPlot::yLeft, yTitle);
}

void HistogramGenerator::setRangeIntensity(double min, double max){
    m_range->setClipValues(min, max);
    m_plot->replot();
}

void HistogramGenerator::setRangeIntensityColor(double min, double max){
    m_rangeColor->setClipValues(min, max);
    m_plot->replot();
}

void HistogramGenerator::setRangePixels(double min, double max){
    m_range->setHeight(m_height);
    m_range->setBoundaryValues(min, max);
    m_plot->replot();
}

void HistogramGenerator::setAxisXRange( double min, double max ){
    m_plot->setAxisScale( QwtPlot::xBottom, min, max );
    m_plot->replot();
}

void HistogramGenerator::setRangePixelsColor(double min, double max){
    m_rangeColor->setHeight(m_height);
    m_rangeColor->setBoundaryValues(min, max);
    m_plot->replot();
}

void HistogramGenerator::setLogScale(bool display){
    m_logCount = display;
    if(m_logCount ){
        m_plot->setAxisScaleEngine(QwtPlot::yLeft, new QwtLogScaleEngine());
        m_histogram->setBaseline(1.0);
        m_plot->setAxisScale( QwtPlot::yLeft, 1, m_maxCount );
    }
    else{
        m_plot->setAxisScaleEngine(QwtPlot::yLeft, new QwtLinearScaleEngine());
        m_histogram->setBaseline(0.0);
        m_plot->setAxisScale( QwtPlot::yLeft, 0, m_maxCount );
    }
    _setVerticalAxisTitle();
    m_plot->replot();
}

void HistogramGenerator::setSelectionMode(bool selection){
    m_range->setSelectionMode( selection );
}

void HistogramGenerator::setSelectionModeColor( bool selection ){
    m_rangeColor->setSelectionMode( selection );
}

bool HistogramGenerator::setSize( int width, int height ){
    bool newSize = false;
    if ( width != m_width || height != m_height ){
        int minLength = qMin( width, height );
        if ( minLength > 0 ){
            m_width = width;
            m_height = height;
            m_range->setHeight( m_height );
            m_rangeColor->setHeight( m_height );
            newSize = true;
        }
        else {
            qWarning() << "Invalid histogram dimensions: "<<width<<" x "<< height;
        }
    }
    return newSize;
}

void HistogramGenerator::setStyle( QString style ){
    m_histogram->setDrawStyle( style );
}

QImage * HistogramGenerator::toImage( ) const {
    QwtPlotRenderer renderer;
    QImage * histogramImage =new QImage(m_width, m_height, QImage::Format_RGB32);
    renderer.renderTo(m_plot, *histogramImage );
    return histogramImage;
}



HistogramGenerator::~HistogramGenerator(){
    m_histogram->detach( );
    m_range->detach();
    m_rangeColor->detach();
    delete m_histogram;
    delete m_range;
    delete m_rangeColor;
}
}
}

