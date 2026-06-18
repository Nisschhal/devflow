import qs from "query-string"

interface FormURLQueryProps {
  params: string
  key: string
  value: string
}
export const formUrlQuery = ({ params, key, value }: FormURLQueryProps) => {
  // convert query params to object {}
  const query = qs.parse(params)
  // add the key to object
  query[key] = value

  return qs.stringifyUrl({
    url: window.location.pathname,
    query,
  })
}

interface RemoveKeysFromUrlQueryProps {
  params: string
  keysToRemove: string[]
}

export const removeKeysFromUrlQuery = ({
  params,
  keysToRemove,
}: RemoveKeysFromUrlQueryProps) => {
  const query = qs.parse(params)
  keysToRemove.forEach((key) => {
    delete query[key]
  })

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    { skipNull: true }, // to not let query value be null; which can be the case sometimes; causing error in fetch
  )
}
