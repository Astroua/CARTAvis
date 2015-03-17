/// Plugin for generating histograms from casa images.

#pragma once

#include "CartaLib/IPlugin.h"
#include <QObject>
#include <vector>
#include "plugins/CasaImageLoader/CCImage.h"
#include "CartaLib/Hooks/HistogramResult.h"


class IImageHistogram;

class Histogram1 : public QObject, public IPlugin
{
    Q_OBJECT
    Q_PLUGIN_METADATA( IID "org.cartaviewer.IPlugin" )
    Q_INTERFACES( IPlugin )
    ;

public:

    Histogram1( QObject * parent = 0 );
    virtual bool
    handleHook( BaseHook & hookData ) override;

    virtual std::vector < HookId >
    getInitialHookList() override;


    virtual ~Histogram1();

private:
    /**
     * Returns histogram data in the form of (intensity,count) pairs.
     * @returns a vector (intensity,count) pairs.
     */
    Carta::Lib::Hooks::HistogramResult  _computeHistogram( );

    /**
     * Returns channel range for the given frequency bounds.
     */
    std::pair<int,int> _getChannelBounds( double freq1, double freq2,  const QString& unitStr ) const;

    /**
     * Returns frequency bounds corresponding to the given channel range.
     */
    std::pair<double,double> _getFrequencyBounds( int channelMin, int channelMax, const QString& unitStr ) const;

    //Histogram implementation.
    std::shared_ptr<IImageHistogram> m_histogram;

    /**
     * The histogram implementation class is templated.  The base is stored so
     * the pointer to the image will not be deleted until the base is changed.
     */
    std::shared_ptr<casa::LatticeBase> base;

    //Current histogram image.  Member variable so image pointer
    //is not destroyed.
    std::shared_ptr<Image::ImageInterface> m_cartaImage;

};
