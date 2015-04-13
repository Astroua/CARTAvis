/**
 * Command for sharing a session.
 */

qx.Class.define("skel.Command.Session.CommandShare", {
    extend : skel.Command.Command,
    type : "singleton",

    /**
     * Constructor.
     */
    construct : function() {
        this.base( arguments, "Share Session", null );
        this.m_toolBarVisible = false;
    },
    
    members : {
        
        doAction : function( vals, undoCB ){
            qx.event.message.Bus.dispatch( new qx.event.message.Message("shareSession", this.getValue()));
        },
        
        getType : function(){
            return skel.Command.Command.TYPE_BOOL;
        }
    }
});