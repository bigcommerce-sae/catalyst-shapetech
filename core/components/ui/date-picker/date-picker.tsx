import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { ComponentPropsWithoutRef, useState } from 'react';
import { DayPicker, DayPickerSingleProps } from 'react-day-picker';

import { Input, InputProps } from '../input';

const Calendar = ({ ...props }: ComponentPropsWithoutRef<typeof DayPicker>) => {
  return (
    <DayPicker
      className="w-[304px] p-3 shadow-md"
      classNames={{
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-base',
        nav: 'space-x-1 flex items-center',
        nav_button:
          'relative flex h-8 w-8 items-center justify-center border-2 border-none border-primary bg-transparent p-0 text-base font-semibold leading-6 text-primary hover:bg-secondary hover:bg-opacity-10 hover:text-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:border-gray-400 disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:text-gray-400',
        nav_button_previous: 'absolute start-1',
        nav_button_next: 'absolute end-1',
        head_row: 'flex',
        head_cell: 'text-gray-400 w-10 text-xs font-normal font-normal',
        row: 'flex w-full',
        cell: 'relative flex h-10 w-10 items-center justify-center p-0 text-center text-xs font-normal focus-within:relative focus-within:z-20 focus-within:rounded focus-within:border focus-within:border-primary/20',
        day: 'h-8 w-8 p-0 text-base hover:bg-secondary/10 focus-visible:outline-none aria-selected:bg-primary aria-selected:text-white aria-selected:hover:bg-primary aria-selected:hover:text-white',

        day_today: 'bg-secondary/10',
        day_disabled: 'text-gray-400 aria-selected:bg-gray-100 aria-selected:text-white',
      }}
      components={{
        IconLeft: () => <ChevronLeftIcon className="h-6 w-6" />,
        IconRight: () => <ChevronRightIcon className="h-6 w-6" />,
      }}
      {...props}
    />
  );
};

Calendar.displayName = 'Calendar';

type Props = Omit<InputProps, 'defaultValue'> & {
  defaultValue?: string | Date;
  selected?: DayPickerSingleProps['selected'];
  onSelect?: DayPickerSingleProps['onSelect'];
  disabledDays?: DayPickerSingleProps['disabled'];
};

const DatePicker = ({
  defaultValue,
  disabledDays,
  selected,
  onSelect,
  placeholder = 'MM/DD/YYYY',
  required,
  ...props
}: Props) => {
  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined,
  );

  const formattedSelected = selected ? Intl.DateTimeFormat().format(selected) : undefined;
  const formattedDate = date ? Intl.DateTimeFormat().format(date) : undefined;

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <Input
          icon={<CalendarIcon />}
          placeholder={placeholder}
          readOnly={true}
          required={required}
          type="text"
          value={formattedSelected ?? formattedDate ?? ''}
          {...props}
        />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          className="z-50 w-auto bg-white p-0 text-base shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={4}
        >
          <Calendar
            disabled={disabledDays}
            initialFocus
            mode="single"
            onSelect={onSelect || setDate}
            required={required}
            selected={selected ?? date}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

DatePicker.displayName = 'DatePicker';

export { DatePicker };
