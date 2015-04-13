/**
 * Container for commands that involve a user session.
 */
/*global mImport */
/*******************************************************************************
 * @ignore( mImport)
 ******************************************************************************/

qx.Class.define("skel.Command.Session.CommandSession", {
    extend : skel.Command.CommandComposite,
    type : "singleton",

    /**
     * Constructor.
     */
    construct : function() {
        this.base( arguments, "Session", null );
        this.m_cmds = [];
        this.m_cmds[0] = skel.Command.Session.CommandShare.getInstance();
        this.m_cmds[1] = skel.Command.Session.CommandSnapshot.getInstance();
        this.setValue( this.m_cmds );
    }
});