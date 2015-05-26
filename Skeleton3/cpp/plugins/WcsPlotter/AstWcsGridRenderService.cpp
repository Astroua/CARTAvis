/**
 *
 **/

#include "AstGridPlotter.h"
#include "AstWcsGridRenderService.h"
#include "FitsHeaderExtractor.h"
#include "CartaLib/LinearMap.h"
#include <QPainter>
#include <QTime>

typedef Carta::Lib::LinearMap1D LinMap;
namespace VG = Carta::Lib::VectorGraphics; // love c++11
namespace VGE = VG::Entries;

namespace WcsPlotterPluginNS
{
struct AstWcsGridRenderService::Pimpl
{
    // we want to remember index and size about fonts
    typedef std::pair < int, double > FontInfo;

    // fits header from the input image
    QStringList fitsHeader;

    // current sky CS
    Carta::Lib::KnownSkyCS knownSkyCS = Carta::Lib::KnownSkyCS::J2000;

    // list of pens
    std::vector < QPen > pens;

    // where in the VG list did we set the pen indices
    std::vector < int64_t > penEntries;

    // where in the VG list did we set the margin dim color
    int64_t dimBrushIndex = - 1;

    // font info
    std::vector < FontInfo > fonts;

    // last submitted job id
    IWcsGridRenderService::JobId lastSubmittedJobId = 0;
};

AstWcsGridRenderService::AstWcsGridRenderService()
    : IWcsGridRenderService()
{
    // initialize private members, starting with pimpl
    m_pimpl.reset( new Pimpl );
    m().pens.resize( static_cast < int > ( Element::__count ), QPen( QColor( "white" ) ) );
    Pimpl::FontInfo tuple( 0, 10.0 );
    m().fonts.resize( static_cast < int > ( Element::__count ), tuple );
    m().penEntries.resize( static_cast < int > ( Element::__count ), - 1 );

    // default pens (other than white)
//    setPen( Element::Shadow, QPen( QColor( 0, 0, 0, 64 ) ) );
//    setPen( Element::MarginDim, QPen( QColor( 0, 0, 0, 64 ) ) );

    // setup the render timer
    m_renderTimer.setSingleShot( true );
    connect( & m_renderTimer, & QTimer::timeout, this, & Me::renderNow );
}

AstWcsGridRenderService::~AstWcsGridRenderService()
{ }

void
AstWcsGridRenderService::setInputImage( Image::ImageInterface::SharedPtr image )
{
    CARTA_ASSERT( image );

    m_iimage = image;

    // get the fits header from this image
    FitsHeaderExtractor fhExtractor;
    fhExtractor.setInput( m_iimage );
    QStringList header = fhExtractor.getHeader();

    // sanity check
    if ( header.size() < 1 ) {
        qWarning() << "Could not extract fits header..."
                   << fhExtractor.getErrors();
    }

    if ( header != m().fitsHeader ) {
        m_vgValid = false;
        m().fitsHeader = header;
    }
} // setInputImage

void
AstWcsGridRenderService::setOutputSize( const QSize & size )
{
    if ( m_outSize != size ) {
        m_vgValid = false;
        m_outSize = size;
    }
}

void
AstWcsGridRenderService::setImageRect( const QRectF & rect )
{
    if ( m_imgRect != rect ) {
        m_vgValid = false;
        m_imgRect = rect;
    }
}

void
AstWcsGridRenderService::setOutputRect( const QRectF & rect )
{
    if ( m_outRect != rect ) {
        m_vgValid = false;
        m_outRect = rect;
    }
}

Carta::Lib::IWcsGridRenderService::JobId AstWcsGridRenderService::startRendering(JobId jobId)
{
    if( jobId < 0) {
        m().lastSubmittedJobId ++;
    } else {
        m().lastSubmittedJobId = jobId;
    }
    // call renderNow asap... asynchronously
    if ( ! m_renderTimer.isActive() ) {
        m_renderTimer.start( 1 );
    }
    return m().lastSubmittedJobId;
}

void
AstWcsGridRenderService::renderNow()
{
    // if the VGList is still valid, we are done
    if ( m_vgValid ) {
        qDebug() << "vgValid saved us a grid redraw xyz";
        emit done( m_vgc.vgList(), m().lastSubmittedJobId );
        return;
    }

    QTime t;
    t.start();

    // clear the current vector graphics in case something goes wrong later
//    m_vgList = VGList();
    m_vgc.clear();

    // if the empty grid reporting is activated, report an empty grid
    if ( m_emptyGridFlag ) {
        emit done( m_vgc.vgList(), m().lastSubmittedJobId );
        return;
    }

    m_vgValid = true;

    // local helper - element to integer
    auto si = [&] ( Element e ) {
        return static_cast < int > ( e );
    };

    // element to pen reference
    auto pi = [&] ( Element e ) -> QPen & {
        return m().pens[si( e )];
    };

    // element to font info reference
    auto fi = [&] ( Element e ) -> Pimpl::FontInfo & {
        return m().fonts[si( e )];
    };

    // make a new VG composer
//    VG::VGComposer m_vgc;
//    m_vgc.clear();

    // dim the border
    {
        double x0 = 0;
        double x1 = m_outRect.left();
        double x2 = m_outRect.right();
        double x3 = m_outSize.width();
        double y0 = 0;
        double y1 = m_outRect.top();
        double y2 = m_outRect.bottom();
        double y3 = m_outSize.height();
        m_vgc.append < VGE::Save > ();
        m_vgc.append < VGE::SetPen > ( Qt::NoPen );
        m().dimBrushIndex =
            m_vgc.append < VGE::StoreIndexedBrush > ( 0, QBrush( pi( Element::MarginDim ).brush() ) );
        m_vgc.append < VGE::SetIndexedBrush > ( 0 );
        m_vgc.append < VGE::DrawRect > ( QRectF( QPointF( x0, y0 ), QPointF( x1, y3 ) ) );
        m_vgc.append < VGE::DrawRect > ( QRectF( QPointF( x2, y0 ), QPointF( x3, y3 ) ) );
        m_vgc.append < VGE::DrawRect > ( QRectF( QPointF( x1, y0 ), QPointF( x2, y1 ) ) );
        m_vgc.append < VGE::DrawRect > ( QRectF( QPointF( x1, y2 ), QPointF( x2, y3 ) ) );
        m_vgc.append < VGE::Restore > ();
    }

    auto elements {
        Element::BorderLines,
        Element::AxisLines1,
        Element::AxisLines2,
        Element::GridLines1,
        Element::GridLines2,
        Element::TickLines1,
        Element::TickLines2,
        Element::NumText1,
        Element::NumText2,
        Element::LabelText1,
        Element::LabelText2,
        Element::Shadow,
        Element::MarginDim
    };

    // setup indexed pens
    for ( auto & e : elements ) {
        m().penEntries[si( e )] =
            m_vgc.append < VGE::StoreIndexedPen > ( si( e ), pi( e ) );
    }

//    LinMap tx( m_imgRect.left(), m_imgRect.right(), m_outRect.left(), m_outRect.right() );
//    LinMap ty( m_imgRect.top(), m_imgRect.bottom(), m_outRect.top(), m_outRect.bottom() );

    // draw the grid
    // =============================
    AstGridPlotter sgp;

//    for ( const QPen & pen : m().pens ) {
//        sgp.pens().push_back( pen );
//    }
    sgp.pens() = m().pens;

    sgp.setInputRect( m_imgRect );
    sgp.setOutputRect( m_outRect );
    sgp.setFitsHeader( m().fitsHeader.join( "" ) );
    sgp.setOutputVGComposer( & m_vgc );

//    sgp.setPlotOption( "tol=0.001" ); // this can slow down the grid rendering!!!
    sgp.setPlotOption( "DrawTitle=0" );

    if ( m_internalLabels ) {
        sgp.setPlotOption( QString( "Labelling=Interior" ) );
    }
    else {
        sgp.setPlotOption( QString( "Labelling=Exterior" ) );
        sgp.setPlotOption( QString( "ForceExterior=1" ) ); // undocumented AST option
    }

    sgp.setPlotOption( "LabelUp(2)=0" ); // align labels to axes
    sgp.setPlotOption( "Size=9" ); // default font
    sgp.setPlotOption( "TextLab(1)=1" );
    sgp.setPlotOption( "TextLab(2)=1" );

    // fonts
    sgp.setPlotOption( QString( "Font(TextLab1)=%1" ).arg( fi( Element::LabelText1 ).first ) );
    sgp.setPlotOption( QString( "Font(TextLab2)=%1" ).arg( fi( Element::LabelText2 ).first ) );
    sgp.setPlotOption( QString( "Font(NumLab1)=%1" ).arg( fi( Element::NumText1 ).first ) );
    sgp.setPlotOption( QString( "Font(NumLab2)=%1" ).arg( fi( Element::NumText2 ).first ) );

    // font sizes
    sgp.setPlotOption( QString( "Size(TextLab1)=%1" ).arg( fi( Element::LabelText1 ).second ) );
    sgp.setPlotOption( QString( "Size(TextLab2)=%1" ).arg( fi( Element::LabelText2 ).second ) );
    sgp.setPlotOption( QString( "Size(NumLab1)=%1" ).arg( fi( Element::NumText1 ).second ) );
    sgp.setPlotOption( QString( "Size(NumLab2)=%1" ).arg( fi( Element::NumText2 ).second ) );

    // line widths
//    sgp.setPlotOption( QString( "Width(grid1)=%1" ).arg( pi( Element::GridLines1 ).widthF() ) );
//    sgp.setPlotOption( QString( "Width(grid2)=%1" ).arg( pi( Element::GridLines2 ).widthF() ) );
//    sgp.setPlotOption( QString( "Width(border)=%1" ).arg( pi( Element::BorderLines ).widthF() ) );
//    sgp.setPlotOption( QString( "Width(axis1)=%1" ).arg( pi( Element::AxisLines1 ).widthF() ) );
//    sgp.setPlotOption( QString( "Width(axis2)=%1" ).arg( pi( Element::AxisLines2 ).widthF() ) );
//    sgp.setPlotOption( QString( "Width(ticks1)=%1" ).arg( pi( Element::TickLines1 ).widthF() ) );
//    sgp.setPlotOption( QString( "Width(ticks2)=%1" ).arg( pi( Element::TickLines2 ).widthF() ) );

    // colors
    sgp.setPlotOption( QString( "Colour(grid1)=%1" ).arg( si( Element::GridLines1 ) ) );
    sgp.setPlotOption( QString( "Colour(grid2)=%1" ).arg( si( Element::GridLines2 ) ) );
    sgp.setPlotOption( QString( "Colour(border)=%1" ).arg( si( Element::BorderLines ) ) );
    sgp.setPlotOption( QString( "Colour(axis1)=%1" ).arg( si( Element::AxisLines1 ) ) );
    sgp.setPlotOption( QString( "Colour(axis2)=%1" ).arg( si( Element::AxisLines2 ) ) );
    sgp.setPlotOption( QString( "Colour(ticks1)=%1" ).arg( si( Element::TickLines1 ) ) );
    sgp.setPlotOption( QString( "Colour(ticks2)=%1" ).arg( si( Element::TickLines2 ) ) );
    sgp.setPlotOption( QString( "Colour(NumLab1)=%1" ).arg( si( Element::NumText1 ) ) );
    sgp.setPlotOption( QString( "Colour(NumLab2)=%1" ).arg( si( Element::NumText2 ) ) );
    sgp.setPlotOption( QString( "Colour(TextLab1)=%1" ).arg( si( Element::LabelText1 ) ) );
    sgp.setPlotOption( QString( "Colour(TextLab2)=%1" ).arg( si( Element::LabelText2 ) ) );

    sgp.setShadowPenIndex( si( Element::Shadow ) );

    // grid density
    sgp.setDensityModifier( m_gridDensity );

    QString system;
    {
        typedef Carta::Lib::KnownSkyCS KS;
        switch ( m().knownSkyCS )
        {
        case KS::J2000 :
            system = "J2000";
            break;
        case KS::B1950 :
            system = "FK4";
            break;
        case KS::ICRS :
            system = "ICRS";
            break;
        case KS::Galactic :
            system = "GALACTIC";
            break;
        case KS::Ecliptic :
            system = "ECLIPTIC";
            break;
        default :
            system = "";
        } // switch
    }

    if ( ! system.isEmpty() ) {
        sgp.setPlotOption( "System=" + system );
    }

    // do the actual plot
    bool plotSuccess = sgp.plot();
//    qDebug() << "plotSuccess=" << plotSuccess;
//    qDebug() << "plotError=" << sgp.getError();
    if( ! plotSuccess) {
        qWarning() << "Grid rendering error:" << sgp.getError();
    }

    qDebug() << "Grid rendered in " << t.elapsed() / 1000.0 << "s";

    // Report the result.
    emit done( m_vgc.vgList(), m().lastSubmittedJobId );
} // startRendering

void
AstWcsGridRenderService::setGridDensityModifier( double density )
{
    if ( m_gridDensity != density ) {
        m_gridDensity = density;
        m_vgValid = false;
    }
}

void
AstWcsGridRenderService::setInternalLabels( bool flag )
{
    if ( m_internalLabels != flag ) {
        m_vgValid = false;
        m_internalLabels = flag;
    }
}

void
AstWcsGridRenderService::setSkyCS( Carta::Lib::KnownSkyCS cs )
{
    // invalidate vglist if the requested coordinate system is different
    // from the last one
    if ( m().knownSkyCS != cs ) {
        m_vgValid = false;
        m().knownSkyCS = cs;
    }
}

void
AstWcsGridRenderService::setPen( Carta::Lib::IWcsGridRenderService::Element e, const QPen & pen )
{
    int ind = static_cast < int > ( e );
    CARTA_ASSERT( ind >= 0 && ind < int ( m().pens.size() ) );
    m().pens[ind] = pen;

    auto si = [&] ( Element e ) {
        return static_cast < int > ( e );
    };
    auto pi = [&] ( Element e ) -> QPen & {
        return m().pens[si( e )];
    };

    // if the list is valid, just change the entry directly
    if ( m_vgValid ) {
        m_vgc.set < VGE::StoreIndexedPen > ( m().penEntries[si( e )], si( e ), pi( e ) );
        if ( e == Element::MarginDim ) {
            m_vgc.set < VGE::StoreIndexedBrush > ( m().dimBrushIndex, 0, pi( e ).brush() );
        }
    }
} // setPen

const QPen &
AstWcsGridRenderService::pen( Carta::Lib::IWcsGridRenderService::Element e )
{
    int ind = static_cast < int > ( e );
    CARTA_ASSERT( ind >= 0 && ind < int ( m().pens.size() ) );
    return m().pens[ind];
}

void
AstWcsGridRenderService::setFont( Carta::Lib::IWcsGridRenderService::Element e,
                                  int fontIndex,
                                  double pointSize )
{
    int ind = static_cast < int > ( e );
    CARTA_ASSERT( ind >= 0 && ind < int ( m().fonts.size() ) );
    Pimpl::FontInfo fontInfo {
        fontIndex, pointSize
    };

    if ( m().fonts[ind] != fontInfo ) {
        m_vgValid = false;
        m().fonts[ind] = fontInfo;
    }
}

void
AstWcsGridRenderService::setEmptyGrid( bool flag )
{
    if ( m_emptyGridFlag != flag ) {
        m_vgValid = false;
        m_emptyGridFlag = flag;
    }
}

inline AstWcsGridRenderService::Pimpl &
AstWcsGridRenderService::m()
{
    return * m_pimpl;
}
}
