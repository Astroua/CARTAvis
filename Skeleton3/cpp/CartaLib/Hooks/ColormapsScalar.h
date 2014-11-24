/**
 * Hook for adding new colormaps to the system.
 *
 **/

#pragma once

#include "CartaLib/CartaLib.h"
#include "CartaLib/IColormapScalar.h"
#include "CartaLib/IPlugin.h"
#include <vector>

namespace Carta
{
namespace Lib
{
namespace Hooks
{
class ColormapsScalarHook : public BaseHook
{
    CARTA_HOOK_BOILER1( ColormapsScalarHook )

public:

    /**
     * @brief Result is a list of colormaps offered by the plugin.
     */
    typedef std::vector < IColormapScalar::SharedPtr > ResultType;

    /**
     * @brief No input
     */
    struct Params { };

    /**
     * @brief PreRender
     * @param pptr
     *
     * @todo make hook constructors protected, so that only hook helper can create them
     */
    ColormapsScalarHook( Params * pptr ) : BaseHook( staticId ), paramsPtr( pptr )
    {
        CARTA_ASSERT( is < Me > () );
    }

    ResultType result;
    Params * paramsPtr;
};
}
}
}
