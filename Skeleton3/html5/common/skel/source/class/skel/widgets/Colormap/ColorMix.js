/**
 * Controls for customize the red, blue, and green settings in an individual color map.
 */
/*global mImport */
/*******************************************************************************
 * @ignore( mImport)
 ******************************************************************************/

qx.Class.define("skel.widgets.Colormap.ColorMix", {
    extend : qx.ui.core.Widget,
    /**
     * Constructor.
     */
    construct : function(  ) {
        this.base(arguments);
        this.m_connector = mImport("connector");
        this._init( );
    },
    
    statics : {
        SLIDER_MIN : 0,
        SLIDER_MAX : 100,
        CMD_SET_COLORMIX : "setColorMix"
    },

    members : {
        /**
         * Return the percentage of a color in the map.
         * @param value {Number} the amount of color.
         * @return {Number} the color percentage.
         */
        _getColorPercent : function( value ){
            var sliderMin = skel.widgets.Colormap.ColorMix.SLIDER_MIN;
            var range = this._getRange();
            var percent = (value - sliderMin) / range;
            return percent;
        },
        
        /**
         * Return the GUI color map range.
         * @return {Number} the GUI color range.
         */
        _getRange : function(){
            return skel.widgets.Colormap.ColorMix.SLIDER_MAX - skel.widgets.Colormap.ColorMix.SLIDER_MIN;
        },

        /**
         * Initializes the UI.
         */
        _init : function(  ) {
            var widgetLayout = new qx.ui.layout.VBox(0);
            this._setLayout(widgetLayout);
            this.setAllowGrowX( true );
            
            var sliderContainer = new qx.ui.container.Composite();
            sliderContainer.setHeight( 50 );
            sliderContainer.setAllowGrowX( true );
            sliderContainer.setLayout( new qx.ui.layout.VBox(2));
            this.m_redSlider = new qx.ui.form.Slider();
            this.m_redSlider.setDecorator( "slider-red");
            this._initSlider( this.m_redSlider, sliderContainer );
            this.m_greenSlider = new qx.ui.form.Slider();
            this.m_greenSlider.setDecorator( "slider-green");
            this._initSlider( this.m_greenSlider, sliderContainer );
            this.m_blueSlider = new qx.ui.form.Slider();
            this._initSlider( this.m_blueSlider, sliderContainer );
            this.m_blueSlider.setDecorator( "slider-blue" );
            this._add( sliderContainer );
            
            this.m_synchronizeCheck = new qx.ui.form.CheckBox( "Synchronize Colors");
            this.m_synchronizeCheck.setValue( true );
            //this._add( this.m_synchronizeCheck );
        },
        
        /**
         * Initialize an color slider.
         * @param slider {qx.ui.form.Slider} the slider to customize.
         * @param sliderGroup {qx.ui.groupbox.GroupBox} the container for the slider.
         */
        _initSlider : function( slider, sliderGroup ){
            slider.setMinimum( skel.widgets.Colormap.ColorMix.SLIDER_MIN );
            slider.setMaximum( skel.widgets.Colormap.ColorMix.SLIDER_MAX );
            slider.addListener( "changeValue",function(e){
                if ( this.m_synchronizeCheck !== null && this.m_synchronizeCheck.getValue()){
                    var newValue = e.getData();
                    if ( this.m_redSlider.getValue() != newValue ){
                        this.m_redSlider.setValue( newValue );
                    }
                    if ( this.m_greenSlider.getValue() != newValue ){
                        this.m_greenSlider.setValue( newValue );
                    }
                    if ( this.m_blueSlider.getValue() != newValue ){
                        this.m_blueSlider.setValue( newValue );
                    }
                    this._sendColorMixChangedCommand();
                }
            }, this );
            slider.setValue( 0 );
            slider.setSingleStep( 1 );
            slider.setPageStep( 10 );
            slider.setFocusable( false );
            slider.setOrientation( "horizontal");
            sliderGroup.add( slider );
        },
        
        /**
         * Return the amount of a color in the map.
         * @param percent {Number} the percentage of the color in the map.
         * @return {Number} the amount of the color in the map.
         */
        _percentToValue : function( percent ){
            var minSlider = skel.widgets.Colormap.ColorMix.SLIDER_MIN;
            var range = this._getRange();
            var value = percent * range + minSlider;
            value = Math.floor( value );
            return value;
        },
        
        /**
         * Notify the server that the color mix has changed.
         */
        _sendColorMixChangedCommand : function(){
            var redPercent = this._getColorPercent( this.m_redSlider.getValue());
            var greenPercent = this._getColorPercent( this.m_greenSlider.getValue());
            var bluePercent = this._getColorPercent( this.m_blueSlider.getValue());
            var path = skel.widgets.Path.getInstance();
            var cmd = this.m_id + path.SEP_COMMAND + skel.widgets.Colormap.ColorMix.CMD_SET_COLORMIX;
            var params = "redPercent:"+redPercent+",greenPercent:"+greenPercent+",bluePercent:"+bluePercent;
            this.m_connector.sendCommand( cmd, params, function(){});
        },
        
        /**
         * Set the server side id of the color map.
         * @param id {String} the unique server side id of this color map.
         */
        setId : function( id ){
            this.m_id = id;
        },
        
        /**
         * Update the GUI with the new color mix percents.
         * @param redPercent {Number} a decimal in [0,1] indicating the red percentage.
         * @param greenPercent {Number} a decimal in [0,1] indicating the green percentage.
         * @param bluePercent {Number} a decimal in [0,1] indicating the blue percentage.
         */
        setMix : function( redPercent, greenPercent, bluePercent ){
            var red = this._percentToValue( redPercent );
            var green = this._percentToValue( greenPercent );
            var blue = this._percentToValue( bluePercent );
            this.m_redSlider.setValue( red );
            this.m_blueSlider.setValue( blue );
            this.m_greenSlider.setValue( green );
        },
        
        /**
         * Adds menu items to the container.
         * @param container {qx.ui.container.Container}.
         */
        addMenuItems : function( container){
            if ( container.indexOf( this.m_synchronizeCheck) < 0 ){
                container.add( this.m_synchronizeCheck );
            }
        },
        
        /**
         * Removes menu items from the container.
         * @param container {qx.ui.container.Container}.
         */
        removeMenuItems : function( container ){
            if ( container.indexOf( this.m_synchronizeCheck) >= 0 ){
                container.remove( this.m_synchronizeCheck);
            }
        },
        
        m_id : null,
        m_connector : null,
        m_redSlider : null,
        m_greenSlider : null,
        m_blueSlider : null,
        m_synchronizeCheck : null
    }
});