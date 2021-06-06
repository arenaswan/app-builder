import { boolean } from './boolean';
import { currency } from './currency';
import { date } from './date';
import { date_range } from './date_range';
import { datetime } from './datetime';
import { datetime_range } from './datetime_range';
import { email } from './email';
import { number } from './number';
import { percent } from './percent';
import { select } from './select';
import { toggle } from './toggle';
import { url } from './url';
import { lookup } from './lookup';
import { master_detail } from './master_detail';
import { object } from './object';
import { grid } from './grid';
import { image } from './image';
import { avatar } from './avatar';
import { formula } from './formula';
import { summary } from './summary';
import { autonumber } from './autonumber';

export const StandardValueTypes = {
    boolean,
    currency,
    // date,//放开会出现死循环，不放开功能正常
    date_range,
    datetime,
    datetime_range,
    email,
    number,
    percent,
    select,
    toggle,
    url,
    lookup,
    master_detail,
    image,
    avatar,
    object,
    grid,
    formula,
    summary,
    autonumber,
};