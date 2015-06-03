! include(../../common.pri) {
  error( "Could not find the common.pri file!" )
}

INCLUDEPATH += $$PROJECT_ROOT
DEPENDPATH += $$PROJECT_ROOT

QT       += core gui

TARGET = plugin
TEMPLATE = lib
CONFIG += plugin

SOURCES += \
    CasaTest1.cpp

HEADERS += \
    CasaTest1.h

CASACOREDIR=../../../../ThirdParty/casacore-shared
WCSLIBDIR=../../../../ThirdParty/wcslib-shared
CFITSIODIR=../../../../ThirdParty/cfitsio-shared
CASACOREDIR=$$absolute_path($${CASACOREDIR})
WCSLIBDIR=$$absolute_path($${WCSLIBDIR})
CFITSIODIR=$$absolute_path($${CFITSIODIR})

casacoreLIBS += -L$${CASACOREDIR}/lib
unix:macx {
	casacoreLIBS += -lcasa_images -lcasa_coordinates -lcasa_fits -lcasa_measures -L/usr/local/lib
}
else{
        casacoreLIBS += -lcasa_images -lcasa_coordinates -lcasa_fits -lcasa_measures
}

casacoreLIBS += -lcasa_lattices -lcasa_tables -lcasa_scimath -lcasa_scimath_f -lcasa_mirlib
casacoreLIBS += -lcasa_casa -llapack -lblas -lgfortran -ldl
casacoreLIBS += -L$${WCSLIBDIR}/lib -lwcs
casacoreLIBS += -L$${CFITSIODIR}/lib -lcfitsio

INCLUDEPATH += $${CASACOREDIR}/include
INCLUDEPATH += $${WCSLIBDIR}/include
INCLUDEPATH += $${CFITSIODIR}/include

LIBS += $${casacoreLIBS}

OTHER_FILES += \
    plugin.json

# copy json to build directory
#MYFILES = $$files($${PWD}/files/*.*)
MYFILES = plugin.json
copy_files.name = copy large files
copy_files.input = MYFILES
# change datafiles to a directory you want to put the files to
copy_files.output = $${OUT_PWD}/${QMAKE_FILE_BASE}${QMAKE_FILE_EXT}
copy_files.commands = ${COPY_FILE} ${QMAKE_FILE_IN} ${QMAKE_FILE_OUT}
copy_files.CONFIG += no_link target_predeps
QMAKE_EXTRA_COMPILERS += copy_files
