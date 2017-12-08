// Copyright 2016-2017, Pulumi Corporation.  All rights reserved.

package config

import (
	"encoding/json"
	"errors"

	"github.com/pulumi/pulumi/pkg/tokens"
)

// Map is a bag of config stored in the settings file.
type Map map[tokens.ModuleMember]Value

// Decrypt returns the configuration as a map from module member to decrypted value.
func (m Map) Decrypt(decrypter Decrypter) (map[tokens.ModuleMember]string, error) {
	r := map[tokens.ModuleMember]string{}
	for k, c := range m {
		v, err := c.Value(decrypter)
		if err != nil {
			return nil, err
		}
		r[k] = v
	}
	return r, nil
}

// HasSecureValue returns true if the config map contains a secure (encrypted) value.
func (m Map) HasSecureValue() bool {
	for _, v := range m {
		if v.Secure() {
			return true
		}
	}

	return false
}

// Value is a single config value.
type Value struct {
	value  string
	secure bool
}

// Value fetches the value of this configuration entry, using decrypter to decrypt if necessary.  If the value
// is a secret and decrypter is nil, or if decryption fails for any reason, a non-nil error is returned.
func (c Value) Value(decrypter Decrypter) (string, error) {
	if !c.secure {
		return c.value, nil
	}
	if decrypter == nil {
		return "", errors.New("non-nil decrypter required for secret")
	}

	return decrypter.DecryptValue(c.value)
}

func (c Value) Secure() bool {
	return c.secure
}

func (c *Value) UnmarshalYAML(unmarshal func(interface{}) error) error {
	var m map[string]string
	err := unmarshal(&m)
	if err == nil {
		if len(m) != 1 {
			return errors.New("malformed secure data")
		}

		val, has := m["secure"]
		if !has {
			return errors.New("malformed secure data")
		}

		c.value = val
		c.secure = true
		return nil
	}

	c.secure = false
	return unmarshal(&c.value)
}

func (c Value) MarshalYAML() (interface{}, error) {
	if !c.secure {
		return c.value, nil
	}

	m := make(map[string]string)
	m["secure"] = c.value

	return m, nil
}

func (c *Value) UnmarshalJSON(b []byte) error {
	var m map[string]string
	err := json.Unmarshal(b, &m)
	if err == nil {
		if len(m) != 1 {
			return errors.New("malformed secure data")
		}

		val, has := m["secure"]
		if !has {
			return errors.New("malformed secure data")
		}

		c.value = val
		c.secure = true
		return nil
	}

	return json.Unmarshal(b, &c.value)
}

func (c Value) MarshalJSON() ([]byte, error) {
	if !c.secure {
		return json.Marshal(c.value)
	}

	m := make(map[string]string)
	m["secure"] = c.value

	return json.Marshal(m)
}

func NewSecureValue(v string) Value {
	return Value{value: v, secure: true}
}

func NewValue(v string) Value {
	return Value{value: v, secure: false}
}