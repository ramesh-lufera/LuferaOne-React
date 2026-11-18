/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import phoneCountryCodes from '../data/phoneCountryCodes';

export default function PhoneCountryCodeSelect({
  id,
  value,
  onChange,
  invalid = false,
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const searchInput = useRef(null);
  const selectedCountry = phoneCountryCodes.find(({ code }) => code === value);
  const query = search.trim().toLocaleLowerCase();
  const countries = phoneCountryCodes.filter(({ code, country }) =>
    `${country} ${code}`.toLocaleLowerCase().includes(query),
  );

  useEffect(() => {
    if (open) searchInput.current?.focus();
  }, [open]);

  const select = (code) => {
    onChange(code);
    setOpen(false);
    setSearch('');
  };

  return (
    <Dropdown
      className="flex-shrink-0"
      show={open}
      onToggle={(next) => {
        setOpen(next);
        setSearch('');
      }}
      onSelect={select}
    >
      <Dropdown.Toggle
        id={id}
        data-theme-exempt
        variant="light"
        className="phone-country-code-toggle form-control h-100 d-flex align-items-center gap-2"
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        aria-label="Phone country code"
        aria-invalid={invalid}
      >
        <span aria-hidden="true">{selectedCountry?.flag || '🌐'}</span>
        <span>{value || 'Select code'}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu
        role="menu"
        style={{ minWidth: 280, maxWidth: 'min(400px, 85vw)' }}
      >
        <div className="px-3 pb-2">
          <input
            ref={searchInput}
            type="search"
            className="form-control"
            aria-label="Search countries or calling codes"
            placeholder="Search country or code"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (countries.length) select(countries[0].code);
              }
            }}
          />
        </div>
        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
          {!query && !selectedCountry && value && (
            <Dropdown.Item role="menuitem" eventKey={value} active>
              🌐 {value}
            </Dropdown.Item>
          )}
          {countries.map(({ code, country, flag }) => (
            <Dropdown.Item
              role="menuitem"
              key={code}
              eventKey={code}
              active={code === value}
              className="d-flex align-items-center gap-2"
              style={{ whiteSpace: 'normal' }}
            >
              <span aria-hidden="true">{flag}</span>
              <span className="text-nowrap">{code}</span>
              <span>{country}</span>
            </Dropdown.Item>
          ))}
          {countries.length === 0 && (
            <div className="px-3 py-2 text-secondary-light" role="status">
              No countries found.
            </div>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
