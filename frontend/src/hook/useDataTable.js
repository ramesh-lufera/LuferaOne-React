import { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'datatables.net-dt';

export default function useDataTable(elementRef, options) {
  const instance = useRef(null);
  useEffect(() => {
    const element = elementRef.current;
    const table = $(element).DataTable(options);
    instance.current = table;
    return () => {
      instance.current = null;
      table.destroy();
      if (options.serverSide) element.querySelector('tbody')?.replaceChildren();
    };
  }, [elementRef, options]);
  return instance;
}
