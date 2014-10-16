/**
 *
 **/

#pragma once

#include "CartaLib/CartaLib.h"
#include "common/CoordinateFormatter.h"

#include <coordinates/Coordinates/CoordinateSystem.h>
#include <memory>

class CCCoordinateFormatter : public CoordinateFormatterInterface
{
    CLASS_BOILERPLATE( CCCoordinateFormatter );

public:

    /// shortcut to AxisInfo type
    typedef Carta::Lib::AxisInfo AxisInfo;

    CCCoordinateFormatter( std::shared_ptr < casa::CoordinateSystem > casaCS );

    virtual CoordinateFormatterInterface *
    clone() const override;

    virtual int
    nAxes() const override;

    virtual QStringList
    formatFromPixelCoordinate( const VD & pix ) override;

    virtual QString
    calculateFormatDistance( const VD & p1, const VD & p2 ) override;

    virtual int
    axisPrecision( int axis ) override;

    virtual Me &
    setAxisPrecision( int precision, int axis ) override;

    virtual bool
    toWorld( const VD & pixel, VD & world ) const override;

    virtual bool
    toPixel( const VD & world, VD & pixel ) const override;

    virtual void
    setTextOutputFormat( TextFormat fmt ) override;

    virtual const Carta::Lib::AxisInfo &
    axisInfo( int ind ) const override;

    virtual Me &
    disableAxis( int ind ) override;

    virtual Me &
    enableAxis( int ind ) override;

    virtual KnownSkyCS
    skyCS() override;

    virtual Me &
    setSkyCS( const KnownSkyCS & scs ) override;

    virtual SkyFormatting
    skyFormatting() override;

    virtual Me &
    setSkyFormatting( SkyFormatting format ) override;

protected:

    /// parse casa's coordinate system
    void
    parseCasaCS();

    std::shared_ptr < casa::CoordinateSystem > m_casaCS;

    /// cached info per axis
    std::vector < AxisInfo > m_axisInfos;

    /// precisions
    std::vector < int > m_precisions;

    /// plain on html output
    TextFormat m_textOutputFormat;

    /// selected format for sky formatting
    SkyFormatting m_skyFormatting = SkyFormatting::Radians;

    /// format a world value for the selected axis
    QString formatWorldValue( int whichAxis, double worldValue);

};
