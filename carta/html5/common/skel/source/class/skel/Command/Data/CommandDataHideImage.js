/**
 * Command to hide a specific image in the stack.
 */
/*global mImport */
/*******************************************************************************
 * @ignore( mImport)
 ******************************************************************************/

qx.Class.define("skel.Command.Data.CommandDataHideImage", {
    extend : skel.Command.Command,

    /**
     * Constructor.
     * @param label {String} - name of the image to hide.
     * @param id {String} - unique id of image to hide.
     */
    construct : function( label, id ) {
        var path = skel.widgets.Path.getInstance();
        var cmd = path.SEP_COMMAND + path.HIDE_IMAGE;
        this.base( arguments, label, cmd);
        this.m_toolBarVisible = false;
        this.setEnabled( true );
        this.m_global = false;
        this.m_id = id;
        this.setToolTipText("Hide the image " + this.getLabel() + ".");
    },
    
    members : {

        doAction : function( vals, undoCB ){
            var path = skel.widgets.Path.getInstance();
            var params = this.m_params + this.m_id;
            var errMan = skel.widgets.ErrorHandler.getInstance();
            if ( skel.Command.Command.m_activeWins.length > 0 ){
                for ( var i = 0; i < skel.Command.Command.m_activeWins.length; i++ ){
                    var windowInfo = skel.Command.Command.m_activeWins[i];
                    var id = windowInfo.getIdentifier();
                    this.sendCommand( id, params, undoCB );
                }
                errMan.clearErrors();
            }
            else {
                errMan.updateErrors( "Error hiding image.");
            }
        },
        m_id : "",
        m_params : "id:"
    }
});