import React from "react";
import PropTypes from "prop-types";
import Tooltip from "../Tooltip";;
import PlainButton from "../PlainButton";
import { localizeTime, durationHumanize } from "../../lib/utils";
import { RefreshScheduleType, RefreshScheduleDefault } from "../proptypes";

import "./ScheduleDialog.css";

export default class SchedulePhrase extends React.Component {
  static propTypes = {
    schedule: RefreshScheduleType,
    isNew: PropTypes.bool.isRequired,
    isLink: PropTypes.bool,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    schedule: RefreshScheduleDefault,
    isLink: false,
    onClick: () => { },
  };

  get content() {
    const { interval: seconds } = (this.props as any).schedule || SchedulePhrase.defaultProps.schedule;
    if (!seconds) {
      return ["Never"];
    }
    const humanized = durationHumanize(seconds, {
      omitSingleValueNumber: true,
    });
    const short = `Every ${humanized}`;
    let full = `Refreshes every ${humanized}`;

    const { time, day_of_week: dayOfWeek } = (this.props as any).schedule;
    if (time) {
      full += ` at ${localizeTime(time)}`;
    }
    if (dayOfWeek) {
      full += ` on ${dayOfWeek}`;
    }

    return [short, full];
  }

  render() {
    if ((this.props as any).isNew) {
      return "Never";
    }

    const [short, full] = this.content;
    const content = full ? <Tooltip title={full}>{short}</Tooltip> : short;

    return (this.props as any).isLink ? (
      <PlainButton type="link" className="schedule-phrase" onClick={(this.props as any).onClick} data-test="EditSchedule">
        {content}
      </PlainButton>
    ) : (
      content
    );
  }
}
