export class DemoFeedbackState {
  isOpen = $state<boolean>(false);

  open = (): void => {
    this.isOpen = true;
  };

  close = (): void => {
    this.isOpen = false;
  };

  setOpen = (val: boolean): void => {
    this.isOpen = val;
  };
}

export const demoFeedbackState = new DemoFeedbackState();
