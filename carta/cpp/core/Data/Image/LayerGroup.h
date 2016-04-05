/***
 * Represents a group of layers in the stack.
 */

#pragma once
#include "Layer.h"
#include "State/ObjectManager.h"
#include "State/StateInterface.h"
#include "CartaLib/IImage.h"

namespace Carta {

namespace Data {

class DrawGroupSynchronizer;

class LayerGroup : public Layer {

Q_OBJECT

public:

    static const QString CLASS_NAME;
    static const QString COMPOSITION_MODE;

    virtual ~LayerGroup();

signals:
    void frameChanged(  Carta::Lib::AxisInfo::KnownType axis);

    void removeLayer( Layer* group);

    void viewLoad( );


protected:

    /**
     * Add a contour set.
     * @param contour - the contour set to add.
     */
    virtual void _addContourSet( std::shared_ptr<DataContours> contour );

    /**
     * Add a data layer to the group.
     * @param fileName - path to the image file.
     * @param success - set to true if the image file is successfully loaded.
     * @param stackIndex - set to the index of the image in this group if it is loaded
     *      in this group.
     * @param colorState - information about the color display for the image.
     * @param viewSize - the current client view size.
     */
    QString _addData(const QString& fileName, bool* success, int* stackIndex,
                      std::shared_ptr<ColorState> colorState=std::shared_ptr<ColorState>(nullptr),
                      QSize viewSize=QSize()  );



    virtual bool _addGroup( /*const QString& state*/ );

    /**
     * Add a layer to this one at the given index.
     * @param layer - the layer to add.
     * @param targetIndex - the index for the new layer.
     */
    virtual void _addLayer( std::shared_ptr<Layer> layer, int targetIndex = -1 ) Q_DECL_OVERRIDE;

    /**
     * Set the child count to zero without actually deleting them.
     */
    //Used when putting layers into groups.
    virtual void _clearChildren() Q_DECL_OVERRIDE;

    /**
     * Remove the color map.
     */
    virtual void _clearColorMap() Q_DECL_OVERRIDE;

    virtual bool _closeData( const QString& id ) Q_DECL_OVERRIDE;

    /**
     * Respond to a change in display axes.
     * @param displayAxisTypes - the x-, y-, and z- axes to display.
     * @param frames - list of image frames.
     */
    virtual void _displayAxesChanged(std::vector<Carta::Lib::AxisInfo::KnownType> displayAxisTypes,
            const std::vector<int>& frames ) Q_DECL_OVERRIDE;

    virtual Carta::Lib::AxisInfo::KnownType _getAxisType( int index ) const Q_DECL_OVERRIDE;
    virtual Carta::Lib::AxisInfo::KnownType _getAxisXType() const Q_DECL_OVERRIDE;
    virtual Carta::Lib::AxisInfo::KnownType _getAxisYType() const Q_DECL_OVERRIDE;
    virtual std::vector<Carta::Lib::AxisInfo::KnownType> _getAxisZTypes() const Q_DECL_OVERRIDE;
    virtual std::vector<Carta::Lib::AxisInfo::KnownType> _getAxisTypes() const Q_DECL_OVERRIDE;

    virtual QPointF _getCenterPixel() const Q_DECL_OVERRIDE;

    /**
     * Return a list of child layers.
     * @return - a list of child layers.
     */
    virtual QList<std::shared_ptr<Layer> > _getChildren() Q_DECL_OVERRIDE;

    /**
     * Return the mode used to composed the layer.
     * @return - a string identifier for the composition mode.
     */
    virtual QString _getCompositionMode() const Q_DECL_OVERRIDE;

    virtual std::shared_ptr<DataContours> _getContour( const QString& name );


    /**
     * Return the coordinates at pixel (x, y) in the given coordinate system.
     * @param x the x-coordinate of the desired pixel.
     * @param y the y-coordinate of the desired pixel.
     * @param system the desired coordinate system.
     * @param frames - list of image frames.
     * @param system - an enumerated coordinate system type.
     * @return the coordinates at pixel (x, y).
     */
    virtual QStringList _getCoordinates( double x, double y, Carta::Lib::KnownSkyCS system,
            const std::vector<int>& frames) const Q_DECL_OVERRIDE;

    /**
     * Return the coordinate system in use.
     * @return - an enumerated coordinate system type.
     */
    virtual Carta::Lib::KnownSkyCS _getCoordinateSystem() const Q_DECL_OVERRIDE;

    /**
     * Returns information about the image at the current location of the cursor.
     * @param mouseX the mouse x-position in screen coordinates.
     * @param mouseY the mouse y-position in screen coordinates.
     * @param frames - list of image frames.
     * @return a QString containing cursor text.
     */
    virtual QString _getCursorText( int mouseX, int mouseY,
            const std::vector<int>& frames ) Q_DECL_OVERRIDE;

    /**
     * Return the data source of the image.
     * @return - the data source of the image.
     */
    virtual std::shared_ptr<DataSource> _getDataSource() Q_DECL_OVERRIDE;
    virtual std::vector< std::shared_ptr<DataSource> > _getDataSources() Q_DECL_OVERRIDE;

    /**
     * Return the image size for the given coordinate index.
     * @param coordIndex an index of a coordinate of the image.
     * @return the corresponding dimension for that coordinate or -1 if none exists.
     */
    virtual int _getDimension( int coordIndex ) const Q_DECL_OVERRIDE;


    /**
     * Return the number of dimensions in the image.
     * @return the number of image dimensions.
     */
    virtual int _getDimension() const Q_DECL_OVERRIDE;


    /**
     * Return the number of frames for the given axis in the image.
     * @param type  - the axis for which a frame count is needed.
     * @return the number of frames for the given axis in the image.
     */
    virtual int _getFrameCount( Carta::Lib::AxisInfo::KnownType type ) const Q_DECL_OVERRIDE;

    //Return data source state.
    virtual Carta::State::StateInterface _getGridState() const Q_DECL_OVERRIDE;

    /**
      * Returns the underlying image.
      */
    virtual std::shared_ptr<Carta::Lib::Image::ImageInterface> _getImage() Q_DECL_OVERRIDE;

    /**
     * Get the image dimensions.
     * @return - a list of frame counts for the current image in each dimension.
     */
    virtual std::vector<int> _getImageDimensions( ) const Q_DECL_OVERRIDE;

    virtual std::vector< std::shared_ptr<Carta::Lib::Image::ImageInterface> > _getImages() Q_DECL_OVERRIDE;

    /**
     * Returns the location on the image corresponding to a screen point in
     * pixels.
     * @param screenPt an (x,y) pair of pixel coordinates.
     * @param valid set to true if an image is loaded that can do the translation; otherwise false;
     * @return the corresponding location on the image.
     */
    virtual QPointF _getImagePt( QPointF screenPt, bool* valid ) const Q_DECL_OVERRIDE;
    virtual int _getIndexCurrent( ) const;

    /**
     * Returns the intensity corresponding to a given percentile.
     * @param frameLow a lower bound for the image frames or -1 if there is no lower bound.
     * @param frameHigh an upper bound for the image frames or -1 if there is no upper bound.
     * @param percentile a number [0,1] for which an intensity is desired.
     * @param intensity the computed intensity corresponding to the percentile.
     * @return true if the computed intensity is valid; otherwise false.
     */
    virtual bool _getIntensity( int frameLow, int frameHigh, double percentile, double* intensity ) const Q_DECL_OVERRIDE;

    /**
     * Returns the identifier for this layer and its children.
     * @return - a list of identifiers for this layer and its children.
     */
    virtual QStringList _getLayerIds( ) const Q_DECL_OVERRIDE;

    /**
     * Get the dimensions of the image viewer (window size).
     * @return the image viewer dimensions.
     */
    virtual QSize _getOutputSize() const Q_DECL_OVERRIDE;

    /**
     * Return the percentile corresponding to the given intensity.
     * @param frameLow a lower bound for the frame index or -1 if there is no lower bound.
     * @param frameHigh an upper bound for the frame index or -1 if there is no upper bound.
     * @param intensity a value for which a percentile is needed.
     * @return the percentile corresponding to the intensity.
     */
    virtual double _getPercentile( int frameLow, int frameHigh, double intensity ) const Q_DECL_OVERRIDE;


    /**
     * Return the pixel coordinates corresponding to the given world coordinates.
     * @param ra the right ascension (in radians) of the world coordinates.
     * @param dec the declination (in radians) of the world coordinates.
     * @return a list consisting of the x- and y-coordinates of the pixel
     *  corresponding to the given world coordinates.
     */
    virtual QStringList _getPixelCoordinates( double ra, double dec ) const Q_DECL_OVERRIDE;


    /**
     * Return the units of the pixels.
     * @return the units of the pixels, or blank if units could not be obtained.
     */
    virtual QString _getPixelUnits() const Q_DECL_OVERRIDE;

    /**
     * Return the value of the pixel at (x, y).
     * @param x the x-coordinate of the desired pixel
     * @param y the y-coordinate of the desired pixel.
     * @param frames - list of image frames.
     * @return the value of the pixel at (x, y), or blank if it could not be obtained.
     *
     * Note the xy coordinates are expected to be in casa pixel coordinates, i.e.
     * the CENTER of the left-bottom-most pixel is 0.0,0.0.
     */
    virtual QString _getPixelValue( double x, double y,
            const std::vector<int>& frames ) const Q_DECL_OVERRIDE;

    virtual std::vector< std::shared_ptr<ColorState> >  _getSelectedColorStates() Q_DECL_OVERRIDE;

    /**
     * Returns the location on the screen corresponding to a location in image coordinates.
     * @param imagePt an (x,y) pair of image coordinates.
     * @param valid set to true if an image is loaded that can do the translation; otherwise false;
     * @return the corresponding pixel coordinates.
     */
    virtual QPointF _getScreenPt( QPointF imagePt, bool* valid ) const Q_DECL_OVERRIDE;

    int _getStackSize() const;
    int _getStackSizeVisible() const;

    /**
     * Return the state of this layer.
     * @param truncatePaths - true if full paths to files should not be given.
     * @return - a string representation of the layer state.
     */
    virtual QString _getStateString( bool truncatePaths ) const Q_DECL_OVERRIDE;

    /**
     * Return the layer vector graphics.
     * @return - the layer vector graphics, which can include both the grid and contours.
     */
    virtual Carta::Lib::VectorGraphics::VGList _getVectorGraphics() Q_DECL_OVERRIDE;

    /**
     * Return the zoom factor for this image.
     * @return the zoom multiplier.
     */
    virtual double _getZoom() const Q_DECL_OVERRIDE;


    virtual void _gridChanged( const Carta::State::StateInterface& state ) Q_DECL_OVERRIDE;

    /**
     * Returns true since other layers can be added to a group.
     * @return - true.
     */
    virtual bool _isComposite() const Q_DECL_OVERRIDE;

    /**
     * Returns true if the identifier passed in matches the id of this layer or one
     * of its children.
     * @param id - an identifier for a layer.
     * @return - true if the passed in identifier matches this layer or one of its
     *      children; false otherwise.
     */
    virtual bool _isDescendant( const QString& id ) const Q_DECL_OVERRIDE;

    /**
     * Returns true if the layer contains nothing visible to the user; false
     * otherwise.
     * @return - true if the layer is empty; false otherwise.
     */
    virtual bool _isEmpty() const Q_DECL_OVERRIDE;

    /**
     * Return a QImage representation of this data.
     * @param frames - a list of frames to load, one for each of the known axis types.
     * @param autoClip true if clips should be automatically generated; false otherwise.
     * @param clipMinPercentile the minimum clip value.
     * @param clipMaxPercentile the maximum clip value.
     */
    virtual void _load( vector<int> frames, bool autoClip, double clipMinPercentile,
               double clipMaxPercentile ) Q_DECL_OVERRIDE;

    /**
     * Remove the contour set from this layer.
     * @param contourSet - the contour set to remove from the layer.
     */
    virtual void _removeContourSet( std::shared_ptr<DataContours> contourSet ) Q_DECL_OVERRIDE;

    /**
     * Generate a new QImage.
     * @param frames - list of image frames.
     * @param cs - an enumerated coordinate system type.
     */
    virtual void _render( const std::vector<int>& frames,
            const Carta::Lib::KnownSkyCS& cs, bool topOfStack ) Q_DECL_OVERRIDE;


    /**
     * Center the image.
     */
    virtual void _resetPan() Q_DECL_OVERRIDE;

    /**
         * Reset the preference state of this layer.
         * @param restoreState - the new layer state.
         */
    virtual void _resetState( const Carta::State::StateInterface& restoreState ) Q_DECL_OVERRIDE;

    /**
     * Reset the zoom to the original value.
     */
    virtual void _resetZoom() Q_DECL_OVERRIDE;

    /**
     * Reset the color map information for this data.
     * @param colorState - stored information about the color map.
     */
    virtual void _setColorMapGlobal( std::shared_ptr<ColorState> colorState ) Q_DECL_OVERRIDE;

    /**
     * Set the mode used to compose this layer.
     * @param compositionMode - the mode used to compose this layer.
     * @param errorMsg - a error message if the composition mode was not successfully set.
     */
    virtual bool _setCompositionMode( const QString& id, const QString& compositionMode,
            QString& errorMsg ) Q_DECL_OVERRIDE;

    /**
     * Give the layer (a more user-friendly) name.
     * @param id - an identifier for the layer to rename.
     * @param name - the new name for the layer.
     * @return - true if the name was successfully reset; false otherwise.
     */
    virtual bool _setLayerName( const QString& id, const QString& name ) Q_DECL_OVERRIDE;

    virtual bool _setLayersGrouped( bool grouped ) Q_DECL_OVERRIDE;

    virtual bool _setMaskColor( const QString& id, int redAmount,
                int greenAmount, int blueAmount ) Q_DECL_OVERRIDE;

    /**
     * Set this data source selected.
     * @param selected - true if the data source is selected; false otherwise.
     * @return -true if the selected state changed; false otherwise.
     */
    virtual bool _setSelected( QStringList& names ) Q_DECL_OVERRIDE;


    /**
     * Reset the default mask color.
     */
    virtual void _setMaskColorDefault() Q_DECL_OVERRIDE;

    /**
     * Set the opacity of the mask.
     * @param alphaAmount - the transparency level in [0,255] with 255 being opaque.
     * @param result - an error message if there was a problem setting the mask opacity or
     *      an empty string otherwise.
     * @return - true if the mask opacity was changed; false otherwise.
     */
    virtual bool _setMaskAlpha( const QString& id, int alphaAmount);

    /**
     * Reset the default mask transparency.
     */
    virtual void _setMaskAlphaDefault() Q_DECL_OVERRIDE;

    /**
     * Set the center for this image's display.
     * @param imgX the x-coordinate of the center.
     * @param imgY the y-coordinate of the center.
     */
    virtual void _setPan( double imgX, double imgY ) Q_DECL_OVERRIDE;

    /**
     * Show/hide this layer.
     * @param visible - true to show the layer; false to hide it.
     */
    virtual bool _setVisible( const QString& id, bool visible ) Q_DECL_OVERRIDE;

    /**
     * Set the zoom factor for this image.
     * @param zoomFactor the zoom multiplier.
     */
    virtual void _setZoom( double zoomFactor ) Q_DECL_OVERRIDE;


    virtual void _updateClips( std::shared_ptr<Carta::Lib::NdArray::RawViewInterface>& view,
            double minClipPercentile, double maxClipPercentile, const std::vector<int>& frames ) Q_DECL_OVERRIDE;

    /**
     * Reset the view to its previous state after a save.
     */
    virtual void _viewReset() Q_DECL_OVERRIDE;

    /**
     * Resize the view of the image.
     */
    virtual void _viewResize( const QSize& newSize ) Q_DECL_OVERRIDE;

    /**
     * Store output size information prior to a save.
     * @param outputSize - the desired output size of the saved image.
     */
    virtual void _viewResizeFullSave(const QSize& outputSize) Q_DECL_OVERRIDE;

    /**
     *  Constructor.
     */
    LayerGroup( const QString& path, const QString& id );
    LayerGroup(const QString& className, const QString& path, const QString& id);

    static const QString LAYERS;

    QList<std::shared_ptr<Layer> > m_children;


protected slots:

    virtual void _colorChanged() Q_DECL_OVERRIDE;

private slots:
    void _renderingDone( QImage image );
    void _removeLayer( Layer* group );

private:

    void _assignColor( int index );
    void _clearData();



    //Get a default name based on the id of the group.
    QString _getDefaultName( const QString& id ) const;

    std::shared_ptr<Layer> _getSelectedGroup();

    void _initializeState();

    void _removeData( int index );

    //Set the color support of the child to conform to that of the group.
    void _setColorSupport( Layer* layer );

    class Factory;
    static bool m_registered;

    std::unique_ptr<DrawGroupSynchronizer> m_drawSync;
    LayerGroup(const LayerGroup& other);
    LayerGroup& operator=(const LayerGroup& other);
};
}
}
