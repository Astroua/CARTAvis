/**
 * Command to show/hide the histogram user settings.
 */
/*global mImport */
/*******************************************************************************
 * @ignore( mImport)
 ******************************************************************************/

qx.Class.define("skel.Command.Settings.SettingsHistogram", {
    extend : skel.Command.Settings.Setting,
    include : skel.Command.Settings.SettingsMixin,
    type : "singleton",

    /**
     * Constructor.
     */
    construct : function( ) {
        var path = skel.widgets.Path.getInstance();
        var cmd = path.SEP_COMMAND + "setSettingsVisible";
        this.base( arguments, "Histogram Settings", cmd);
        this.setToolTipText( "Show/hide histogram settings.");
        this.m_global = false;
        this.setEnabled( false );
        this.setValue( false );
    },
    
    members : {
        
        _resetEnabled : function(){
            arguments.callee.base.apply(this, arguments);
            var enabled = this.resetPrefs();
           
        },
        

        
        /**
         * Update the visibility of the histogram settings based on server state.
         * @param obj {Object} the server object containing visibility of individual
         *      user configuration settings.
         */
        resetValueFromServer : function( obj ){
            if ( this.getValue() != obj.settings ){
                this.setValue( obj.settings );
            }
        }
    }
});