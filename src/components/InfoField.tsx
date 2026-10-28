interface Props {
  name: string;
  children: React.ReactNode;
}

// A single piece of information on an info page, e.g. "Domestic name: Sverige"
export default function InfoField({ name, children }: Props) {
  return (
    <div>
      <span className='font-bold'>{name}:</span> {children}
    </div>
  );
}
