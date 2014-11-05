/**
 *
 **/

#pragma once

#include "common/misc.h"
#include "common/IImage.h"
#include <coordinates/Coordinates/CoordinateSystem.h>
#include <memory>


class CCMetaDataInterface : public Image::MetaDataInterface
{
    CLASS_BOILERPLATE( CCMetaDataInterface);

public:
    CCMetaDataInterface(QString htmlTitle, std::shared_ptr<casa::CoordinateSystem> casaCS);

    virtual Image::MetaDataInterface *
    clone() override;

    virtual CoordinateFormatterInterface::SharedPtr
    coordinateFormatter() override;

    virtual CoordinateGridPlotterInterface::SharedPtr
    coordinateGridPlotter() override;

    virtual PlotLabelGeneratorInterface::SharedPtr
    plotLabelGenerator() override;

    virtual QString
    title( TextFormat format ) override;

    virtual QStringList
    otherInfo( TextFormat format ) override;

protected:
    Carta::Lib::HtmlString m_title;
    std::shared_ptr<casa::CoordinateSystem> m_casaCS;

};
