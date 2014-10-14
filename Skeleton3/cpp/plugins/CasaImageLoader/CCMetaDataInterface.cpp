/**
 *
 **/


#include "CCMetaDataInterface.h"
#include "CCCoordinateFormatter.h"

CCMetaDataInterface::CCMetaDataInterface(QString htmlTitle, std::shared_ptr<casa::CoordinateSystem> casaCS)
{
    m_title = Carta::HtmlString::fromHtml( htmlTitle);
    m_casaCS = casaCS;
}


Image::MetaDataInterface *CCMetaDataInterface::clone()
{
    qFatal( "not implemented");
}

CoordinateFormatterInterface::SharedPtr CCMetaDataInterface::coordinateFormatter()
{
    return std::make_shared<CCCoordinateFormatter>( m_casaCS);
//    qFatal( "not implemented");
}

CoordinateGridPlotterInterface::SharedPtr CCMetaDataInterface::coordinateGridPlotter()
{
    qFatal( "not implemented");
}

PlotLabelGeneratorInterface::SharedPtr CCMetaDataInterface::plotLabelGenerator()
{
    qFatal( "not implemented");
}

QString CCMetaDataInterface::title(TextFormat format)
{
    if( format == TextFormat::Plain) {
        return m_title.plain();
    }
    else {
        return m_title.html();
    }

}

QStringList CCMetaDataInterface::otherInfo(TextFormat format)
{
    Q_UNUSED( format);
    qFatal( "not implemented");
}
