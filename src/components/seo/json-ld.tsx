type Props = { data: object | object[] };

export function JsonLd({ data }: Props) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((obj, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );
}
