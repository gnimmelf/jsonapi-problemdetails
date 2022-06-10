import dayjs from 'dayjs';

export const isoStr2DateAndTime: string = (isoStr = '') =>
  dayjs(isoStr).format('DD.MM.YYYY, [kl.] HH:mm.').toLocaleString();

export const isoStr2Time: string = (isoStr = '') =>
  dayjs(isoStr).format('[kl.] HH:mm.').toLocaleString();
