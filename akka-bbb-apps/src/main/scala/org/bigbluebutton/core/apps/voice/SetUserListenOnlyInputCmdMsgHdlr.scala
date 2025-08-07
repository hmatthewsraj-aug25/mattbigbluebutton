package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs.SetUserListenOnlyInputCmdMsg
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.apps.voice.VoiceApp
import org.bigbluebutton.core.models.{ Roles, Users2x, VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait SetUserListenOnlyInputCmdMsgHdlr extends RightsManagementTrait {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetUserListenOnlyInputCmdMsg(msg: SetUserListenOnlyInputCmdMsg) {
    val meetingId = liveMeeting.props.meetingProp.intId
    val voiceConf = liveMeeting.props.voiceProp.voiceConf

    log.info("Received listen only input device change for user request. meetingId=" + meetingId + " userId="
      + msg.header.userId + " listenOnlyInputDevice=" + msg.body.listenOnlyInputDevice)

    for {
      requester <- Users2x.findWithIntId(
        liveMeeting.users2x,
        msg.header.userId
      )
      u <- VoiceUsers.findWithIntId(
        liveMeeting.voiceUsers,
        msg.header.userId
      )
    } yield {
      if (u.listenOnlyInputDevice != msg.body.listenOnlyInputDevice) {
        log.info("Send set listen only input device user request. meetingId=" + meetingId + " userId=" + u.intId + " listenOnlyInputDevice=" + msg.body.listenOnlyInputDevice)
        VoiceApp.setListenOnlyInputInVoiceConf(
          liveMeeting,
          outGW,
          u.intId,
          msg.body.listenOnlyInputDevice
        )
      }
    }
  }
}
