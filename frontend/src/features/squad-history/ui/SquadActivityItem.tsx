import { CharacterAvatar } from '@/entities/character/index.ts';
import {
  describeSquadActivity,
  type ISquadActivity,
  type TSquadActivityType,
} from '@/entities/squad/index.ts';
import { formatDateTime, formatRelativeTime } from '@/shared/lib/helpers/date.helper.ts';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { Avatar, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import type { ReactElement } from 'react';

const ACTIVITY_ICONS: Record<TSquadActivityType, ReactElement> = {
  'squad.created': <AddCircleOutlinedIcon fontSize="small" />,
  'squad.updated': <EditOutlinedIcon fontSize="small" />,
  'squad.deleted': <DeleteOutlinedIcon fontSize="small" />,
  'squad.member-added': <GroupOutlinedIcon fontSize="small" />,
  'squad.member-removed': <GroupOutlinedIcon fontSize="small" />,
};

interface ISquadActivityItemProps {
  activity: ISquadActivity;
  now: Date;
}

export function SquadActivityItem({ activity, now }: ISquadActivityItemProps): ReactElement {
  return (
    <ListItem disableGutters>
      <ListItemAvatar>
        {activity.character ? (
          <CharacterAvatar character={activity.character} />
        ) : (
          <Avatar sx={{ bgcolor: 'primary.light' }}>{ACTIVITY_ICONS[activity.type]}</Avatar>
        )}
      </ListItemAvatar>
      <ListItemText
        primary={describeSquadActivity(activity)}
        secondary={
          <time dateTime={activity.occurredAt} title={formatDateTime(activity.occurredAt)}>
            {formatRelativeTime(activity.occurredAt, now)}
          </time>
        }
      />
    </ListItem>
  );
}
