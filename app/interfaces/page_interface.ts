import { ProductT } from "../types"

export interface ShowPageProps {
    product: ProductT
  }


export interface ShowPageChildProps {
  product: ProductT,
  selected: any,
  setSelected: any,
  handleOnAddToCart: any,
  setNumberToAdd: any,
  numberToAdd: number,
  slideNumber: number,
  setSlideNumber: any,
  upcomingItems?: any,
  isNewProduct: boolean,
  isAddingToCart?: boolean,
  addToCartSuccess?: boolean,
}

export interface CountdownTimerProps {
  timeLeftObj: {
    days: number,
    hours: number,
    minutes: number,
    seconds: number
  }
}

export interface UpcomingDropPreviewProps {
  timeLeftObj: {
    days: number,
    hours: number,
    minutes: number,
    seconds: number
  },
  products: any,
  dropTitle: string
}

export interface EmailFormProps {
  isSidebar?: boolean;
  placeholder?: string;
  formClassName?: string;
  inputContainerClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  messageContainerClassName?: string;
  onSuccess?: () => void;
}

export type TimeLeftObj = {
  days: number,
  hours: number,
  minutes: number,
  seconds: number,
  total: number
}
