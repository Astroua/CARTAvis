/**
 * Implements the parser callbacks to produce regions.
 */
#pragma once
#include <string>
#include <vector>
#include <list>
#include <measures/Measures/MDirection.h>

namespace Carta {
    namespace Lib {
        namespace Regions {
            class RegionBase;
        }
    }
}

extern double degToRad(double);
extern double radToDeg(double);

double parseSEXStr(const char* d);
extern double parseHMSStr(const char* str);
extern double parseDMSStr(const char* str);

std::vector<double> coordtovec( double * );
std::vector<double> doubletovec( double x=1, double y=1, double z=1 );

typedef std::vector<double> Vertex;
typedef std::vector<double> Vector;
typedef std::string Tag;

enum CoordSystem { IMAGE, PHYSICAL, AMPLIFIER, DETECTOR, WCS,
    WCSA, WCSB, WCSC, WCSD, WCSE, WCSF, WCSG, WCSH, WCSI,
    WCSJ, WCSK, WCSL, WCSM, WCSN, WCSO, WCSP, WCSQ, WCSR,
    WCSS, WCST, WCSU, WCSV, WCSW, WCSX, WCSY, WCSZ, WCS0
};

enum SkyFrame {FK4, FK4_NO_E, FK5, ICRS, GALACTIC, SUPERGALACTIC,
    ECLIPTIC, HELIOECLIPTIC, NATIVEWCS};
enum SkyDist {DEGREE, ARCMIN, ARCSEC};
enum PointShape {CIRCLE,BOX,DIAMOND,CROSS,XPT,ARROW,BOXCIRCLE};

inline casa::MDirection::Types todirection( SkyFrame frame ) {
    switch ( frame ) {
    case FK4:
        return casa::MDirection::B1950;
    case FK5:
        return casa::MDirection::J2000;
    case GALACTIC:
        return casa::MDirection::GALACTIC;
    case ECLIPTIC:
        return casa::MDirection::ECLIPTIC;
    default:
        return casa::MDirection::GALACTIC;
    }
}

inline const char *tostr(SkyFrame sf) {
    return sf == FK4 ? "FK4" :
            sf == FK5 ? "FK5" :
                    sf == ICRS ? "ICRS" :
                            sf == ECLIPTIC ? "ECLIPTIC" : "NATIVEWCS";
}

inline const char * tostr(CoordSystem cs) {
    return cs == IMAGE ? "IMAGE" :
            cs == PHYSICAL ? "PHYSICAL" :
                    cs == AMPLIFIER ? "AMPLIFIER" :
                            cs == DETECTOR ? "DETECTOR" :
                                    cs == WCS ? "WCS" : cs == WCSA ? "WCSA" :
                                            cs == WCSB ? "WCSB" : cs == WCSC ? "WCSC" :
                                                    cs == WCSD ? "WCSD" : cs == WCSE ? "WCSE" :
                                                            cs == WCSF ? "WCSF" : cs == WCSG ? "WCSG" :
                                                                    cs == WCSH ? "WCSH" : cs == WCSI ? "WCSI" :
                                                                            cs == WCSJ ? "WCSJ" : cs == WCSK ? "WCSK" :
                                                                                    cs == WCSL ? "WCSL" : cs == WCSM ? "WCSM" :
                                                                                            cs == WCSN ? "WCSN" : cs == WCSO ? "WCSO" :
                                                                                                    cs == WCSP ? "WCSP" : cs == WCSQ ? "WCSQ" :
                                                                                                            cs == WCSR ? "WCSR" : cs == WCSS ? "WCSS" :
                                                                                                                    cs == WCST ? "WCST" : cs == WCSU ? "WCSU" :
                                                                                                                            cs == WCSV ? "WCSV" : cs == WCSW ? "WCSW" :
                                                                                                                                    cs == WCSX ? "WCSX" : cs == WCSY ? "WCSY" :
                                                                                                                                            cs == WCSZ ? "WCSZ" : "WCS0";
}

/*inline const char *tostr( SkyDist f ) {
    return f == DEGREES ? "DEGREES" :
            f == SEXAGESIMAL ? "SEXAGESIMAL" :
                    f == ARCMIN ? "ARCMIN" : "ARCSEC";
}*/
inline const char *tostr( SkyDist f ) {
    return f == DEGREE ? "DEGREE" :
            //f == SEXAGESIMAL ? "SEXAGESIMAL" :
                    f == ARCMIN ? "ARCMIN" : "ARCSEC";
}

class ContextDs9 {
public:

    /**
     * Constructor.
     */
    ContextDs9( );

    /**
     * Returns a list of regions that were read by the parser.
     * @return - a list of regions returned by the parser.
     */
    std::vector<std::shared_ptr<Carta::Lib::Regions::RegionBase> > getRegions() const;

    //-----------------------------------------------------------------------------------------
    //               Internal methods called by the parser.

    //********** Implemented ******************************************************************/
    void createBoxCmd( const Vector& /*center*/, const Vector& /*size*/, double /*angle*/,
            const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/, const char* /*comment*/,
            const std::list<Tag>& /*tag*/ );
    void createEllipseCmd( const Vector& /*center*/, const Vector& /*radius*/, double /*angle*/,
            const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/, const char* /*comment*/,
            const std::list<Tag>& /*tag*/ );
    void createCircleCmd( const Vector& /*center*/, double /*radius*/, const char* /*color*/, int* /*dash*/,
            int /*width*/, const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ );
    void createPolygonCmd( const Vector& center, const Vector& bb, const char* color, int* dash,
            int width, const char* font, const char* text, unsigned short prop,
            const char* comment, const std::list<Tag>& tag );
    void createPolygonCmd( const std::list<Vertex>& list, const char* color, int* dash,
            int width, const char* font, const char* text, unsigned short prop,
            const char* comment, const std::list<Tag>& tag );
    void createPointCmd( const Vector&, PointShape, int, const char*, int*, int, const char*,
            const char*, unsigned short, const char*, const std::list<Tag>& );
    void createCirclePointCmd( const Vector& center, int size, const char* color, int* dash,
            int width, const char* font, const char* text, unsigned short prop,
            const char* comment, const std::list<Tag>& tag );
    void createBoxPointCmd( const Vector& center, int size, const char* color, int* dash,
            int width, const char* font, const char* text, unsigned short prop,
            const char* comment, const std::list<Tag>& tag );
    void createDiamondPointCmd( const Vector& center, int size, const char* color, int* dash,
            int width, const char* font, const char* text, unsigned short prop,
            const char* comment, const std::list<Tag>& tag );
    void createCrossPointCmd( const Vector& center, int size, const char* color, int* dash,
            int width, const char* font, const char* text, unsigned short prop,
            const char* comment, const std::list<Tag>& tag );
    void createExPointCmd( const Vector& center, int size, const char* color, int* dash,
            int width, const char* font, const char* text, unsigned short prop,
            const char* comment, const std::list<Tag>& tag );
    void createArrowPointCmd( const Vector& center, int size, const char* color, int* dash,
            int width, const char* font, const char* text, unsigned short prop,
            const char* comment, const std::list<Tag>& tag );
    void createBoxCirclePointCmd( const Vector& center, int size, const char* color, int* dash,
            int width, const char* font, const char* text, unsigned short prop,
            const char* comment, const std::list<Tag>& tag );


    //********** NOT Implemented **************************************************************/
    void createContourPolygonCmd( const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/, const char* /*comment*/,
            const std::list<Tag>& /*tag*/ ) { }

    void createCompassCmd( const Vector& /*center*/, double /*r*/, const char* /*north*/, const char* /*east*/,
            int /*na*/, int /*ea*/, CoordSystem /*sys*/, SkyFrame /*sky*/, const char* /*color*/, int* /*dash*/,
            int /*width*/, const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createCompositeCmd( const Vector& /*center*/, double /*angle*/, int /*global*/, const char* /*color*/, int* /*dash*/,
            int /*width*/, const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createVectCmd( const Vector& /*center*/, const Vector& /*p2*/, int /*arrow*/,const char* /*color*/, int* /*dash*/,
            int /*width*/, const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createVectCmd( const Vector& /*center*/, double /*mag*/, double /*ang*/, int /*arrow*/, const char* /*color*/, int* /*dash*/,
            int /*width*/, const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createProjectionCmd( const Vector& /*center*/, const Vector& /*p2*/, double /*w*/, const char* /*mvcb*/,
            const char* /*delcb*/, const char* /*color*/, int* /*dash*/, int /*width*/,
            const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createRulerCmd( const Vector& /*center*/, const Vector& /*p2*/, CoordSystem /*sys*/, SkyFrame /*sky*/,
            CoordSystem /*distsys*/, SkyDist /*distformat*/, const char* /*color*/, int* /*dash*/,
            int /*width*/, const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createCircle3dCmd( const Vector& /*center*/, double /*radius*/, const char* /*mvcb*/,
            const char* /*delcb*/, const char* /*color*/, int* /*dash*/, int /*width*/,
            const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createAnnulusCmd( const Vector& /*center*/, double /*start*/, double /*stop*/, int /*num*/,
            const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/, const char* /*comment*/,
            const std::list<Tag>& /*tag*/ ) { }

    void createAnnulusCmd( const Vector& /*center*/, int /*num*/, double* /*radii*/, const char* /*color*/, int* /*dash*/,
            int /*width*/, const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createCpandaCmd( const Vector& /*center*/, double /*ang1*/, double /*ang2*/, int /*an*/,
            double /*rad1*/, double /*rad2*/, int /*rn*/, const char* /*color*/, int* /*dash*/,
            int /*width*/, const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createCpandaCmd( const Vector& /*center*/, int /*an*/, double* /*a*/, int /*rn*/, double* /*r*/,
            const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/, const char* /*comment*/,
            const std::list<Tag>& /*tag*/ ) { }

    void createEllipseAnnulusCmd( const Vector& /*center*/, const Vector& /*inner*/,
            const Vector& /*outer*/, int /*num*/, double /*angle*/,
            const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/, const char* /*comment*/,
            const std::list<Tag>& /*tag*/ ) { }

    void createEllipseAnnulusCmd( const Vector& /*center*/, int /*num*/, Vector* /*radii*/, double /*angle*/,
            const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/, const char* /*comment*/,
            const std::list<Tag>& /*tag*/ ) { }

    void createEpandaCmd( const Vector& /*center*/, double /*ang1*/, double /*ang2*/, int /*an*/,
            const Vector& /*rad1*/, const Vector& /*rad2*/, int /*rn*/, double /*angle*/,
            const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/, const char* /*comment*/,
            const std::list<Tag>& /*tag*/ ) { }

    void createEpandaCmd( const Vector& /*center*/, int /*an*/, double* /*a*/, int /*rn*/, Vector* /*r*/,
            double /*angle*/, const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/, const char* /*comment*/,
            const std::list<Tag>& /*tag*/ ) { }

    void createLineCmd( const Vector& /*center*/, const Vector& /*p2*/, int /*arrow1*/, int /*arrow2*/,
            const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createBoxAnnulusCmd( const Vector& /*center*/, const Vector& /*inner*/, const Vector& /*outer*/,
            int /*num*/, double /*angle*/, const char* /*color*/, int* /*dash*/,
            int /*width*/, const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createBoxAnnulusCmd( const Vector& /*center*/, int /*num*/, Vector* /*size*/, double /*angle*/,
            const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/, const char* /*comment*/,
            const std::list<Tag>& /*tag*/ ) { }

    void createBpandaCmd( const Vector& /*center*/, double /*ang1*/, double /*ang2*/, int /*an*/,
            const Vector& /*rad1*/, const Vector& /*rad2*/, int /*rn*/, double /*angle*/,
            const char* /*color*/, int* /*dash*/, int /*width*/, const char* /*font*/,
            const char* /*text*/, unsigned short /*prop*/, const char* /*comment*/,
            const std::list<Tag>& /*tag*/ ) { }

    void createBpandaCmd( const Vector& /*center*/, int /*an*/, double* /*a*/, int /*rn*/, Vector* /*r*/,
            double /*angle*/,const char* /*color*/, int* /*dash*/, int /*width*/,
            const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void createSegmentCmd( const std::list<Vertex>&, const char*, int*, int, const char*,
            const char*, unsigned short, const char*, const std::list<Tag>& ){}

    void createTextCmd( const Vector& /*center*/, double /*angle*/, int /*rotate*/, const char* /*color*/, int* /*dash*/,
            int /*width*/, const char* /*font*/, const char* /*text*/, unsigned short /*prop*/,
            const char* /*comment*/, const std::list<Tag>& /*tag*/ ) { }

    void markerDeleteLastCmd() { }
    void resetCompositeMarker() { }

    //Conversion
    double mapAngleFromRef(double /*angle*/, CoordSystem /*sys*/, SkyFrame /*sky*/);
    double mapAngleToRef(double /*angle*/, CoordSystem /*sys*/, SkyFrame /*sky*/);
    double mapLenToRef(double d, CoordSystem sys, SkyDist format=DEGREE);
    Vector mapLenToRef(const Vector &, CoordSystem sys, SkyDist format=DEGREE);
    Vector mapToRef(const Vector& v, CoordSystem sys, SkyFrame format=FK5);

    virtual ~ContextDs9();
private:
    std::vector<std::shared_ptr<Carta::Lib::Regions::RegionBase> > m_regions;
};

