export function handleGraphQLErrors(response) {
  const data = response.data;
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data;
}