import { boolean } from './boolean';
import { currency } from './currency';
import { currency_range } from './currency_range';
import { date } from './date';
import { date_range } from './date_range';
import { datetime } from './datetime';
import { datetime_range } from './datetime_range';
import { textarea } from './textarea';
import { html } from './html';
import { email } from './email';
import { number } from './number';
import { number_range } from './number_range';
import { percent } from './percent';
import { select } from './select';
import { toggle } from './toggle';
import { url } from './url';
import { lookup } from './lookup';
import { master_detail } from './master_detail';
import { object } from './object';
import { grid } from './grid';
import { image } from './image';
import { file } from './file';
import { avatar } from './avatar';
import { formula } from './formula';
import { summary } from './summary';
import { autonumber } from './autonumber';
import { code } from './code';
import { password } from './password';
import { ComponentRegistry } from "@steedos-ui/builder-store";
import { defaultsDeep } from 'lodash';

export const StandardValueTypes = {
    boolean,
    currency,
    currency_range,
    date,
    date_range,
    datetime,
    datetime_range,
    textarea,
    html,
    email,
    number,
    number_range,
    percent,
    select,
    toggle,
    url,
    lookup,
    master_detail,
    image,
    file,
    avatar,
    object,
    grid,
    formula,
    summary,
    autonumber,
    code,
    password,
};
ComponentRegistry.valueTypes = defaultsDeep({}, ComponentRegistry.valueTypes, StandardValueTypes);