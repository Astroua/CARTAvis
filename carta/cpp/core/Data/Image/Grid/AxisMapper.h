/***
 * Translates between the enum of AxisInfo objects to user readable strings.
 *
 */

#pragma once

#include "State/ObjectManager.h"
#include "State/StateInterface.h"
#include "CartaLib/AxisInfo.h"

namespace Carta {

namespace Data {

class AxisMapper {

public:

    /**
     * Returns a standard axis purpose based on the one passed in, which may
     * have different capitalization characteristics.
     * @param purpose - an axis purpose that may have incorrect capitalization.
     * @return the corresponding standardized purpose or an empty string if no such
     *      purpose exists.
     */
    static QString getPurpose( const QString& purpose );

    /**
     * Returns a purpose for the axis of the known type.
     * @param type - an identifier for an axis type.
     * @return a string based purpose for the axis passed in.
     */
    static QString getPurpose( Carta::Lib::AxisInfo::KnownType type );

    /**
     * Returns the default purpose for the standard x-, y-, and z- display axes.
     * @param axis - and identifier for the x-, y, or z- display axes.
     * @return the default purpose for the display axis.
     */
    static QString getDefaultPurpose( const QString& axis );

    /**
     * Returns the axis type identifier for the axis with the given purpose.
     * @param purpose - a string describing the purpose of an axis.
     * @return the corresponding axis type or Carta::Lib::AxisInfo::OTHER if the
     *      purpose is not recognized.
     */
    static Carta::Lib::AxisInfo::KnownType getType( const QString& purpose );

    /**
     * Returns the standard axis name for an x-, y-, or z- display axis that may not
     *      have correct capitalization.
     * @param axisName - an identifier for one of the display axes that may not have
     *      standard capitalization.
     * @return the standard name for the display axis or an empty string if the display
     *      axis was not recognized.
     */
    static QString getDisplayName( const QString& axisName );

    static QStringList getDisplayNames();

    virtual ~AxisMapper();

    const static QString AXIS_X;
    const static QString AXIS_Y;
    const static QString RIGHT_ASCENSION;
    const static QString DECLINATION;
    const static QString SPECTRAL;
    const static QString STOKES;
    const static QString TABULAR;
    const static QString QUALITY;

private:

    AxisMapper( );


    const static QList<QString> m_purposes;
	AxisMapper( const AxisMapper& other);
	AxisMapper& operator=( const AxisMapper& other );
};

}
}
