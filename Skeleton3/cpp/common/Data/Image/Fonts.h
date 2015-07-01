/***
 * List of all available Fonts.
 *
 */

#pragma once

#include "State/ObjectManager.h"
#include "State/StateInterface.h"
#include <vector>

namespace Carta {

namespace Data {

class Fonts : public Carta::State::CartaObject {

public:

    /**
     * Returns true if the name represents a supported font family; false, otherwise.
     * @param name - a QString identifying a font family.
     * @return true if the name represents a supported font family; false, otherwise.
     */
    bool isFontFamily( const QString& name ) const;

    /**
     * Returns true if the value is a supported font size; false, otherwise.
     * @param fontSize - a font point size.
     * @return true if the font size is supported; false, otherwise.
     */
    bool isFontSize( int fontSize ) const;

    /**
     * Returns a list of available font families.
     * @return a QStringList containing the names of available font families.
     */
    QStringList getFontFamilies() const;

    /**
     * Returns a list of available font sizes.
     * @return a QStringList containing the available font point sizes.
     */
    QStringList getFontSizes() const;

    /**
     * Returns the index of the font family or -1 if no such font family exists.
     * @param name - an identifier for a font family.
     * @return the index of the identified font family or -1 if no such family exists.
     */
    int getIndex( const QString& name) const;

    /**
     * Returns the default font family.
     * @return an identifier for the default font family.
     */
    QString getDefaultFamily() const;

    /**
     * Returns the default font size.
     * @return an identifier for the default font size.
     */
    int getDefaultSize() const;

    virtual ~Fonts();


    const static QString CLASS_NAME;
    const static QString FONT_SIZE;
    const static QString FONT_FAMILY;
private:

    void _initializeDefaultState();
    void _initializeCallbacks();

    std::vector<QString> m_fontFamilies;
    std::vector<int> m_fontSizes;


    static bool m_registered;

    Fonts( const QString& path, const QString& id );

    class Factory;


	Fonts( const Fonts& other);
	Fonts& operator=( const Fonts& other );
};

}
}
