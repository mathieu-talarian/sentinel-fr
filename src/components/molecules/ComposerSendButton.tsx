import { IconButton } from "@/components/atoms/IconButton";
import { Icon } from "@/components/atoms/Icons";

interface ComposerSendButtonPropsT {
  running: boolean;
  canSend: boolean;
  onSend: () => void;
  onStop: () => void;
}

export function ComposerSendButton(props: Readonly<ComposerSendButtonPropsT>) {
  if (props.running) {
    return (
      <IconButton
        size="lg"
        variant="danger"
        title="Stop"
        onClick={props.onStop}
      >
        <Icon.Stop />
      </IconButton>
    );
  }

  return (
    <IconButton
      size="lg"
      variant="primary"
      disabled={!props.canSend}
      title="Send"
      onClick={props.onSend}
    >
      <Icon.Send />
    </IconButton>
  );
}
