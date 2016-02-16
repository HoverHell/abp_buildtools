# coding: utf8
"""
A close equivalent of `six` but minimised for avoiding an extra dependency.
"""

from __future__ import division, absolute_import, print_function  # , unicode_literals

try:
  from StringIO import StringIO
except ImportError:
  from io import StringIO

try:
  from urllib2 import urlopen, Request
except ImportError:
  from urllib.request import urlopen, Request

try:
  string_types = (basestring,)
except NameError:
  string_types = (str,)

try:
  import ConfigParser
  from ConfigParser import SafeConfigParser, RawConfigParser
except ImportError:
  import configparser as ConfigParser
  from configparser import SafeConfigParser, RawConfigParser


try:
  from urlparse import urlsplit, urljoin
except ImportError:
  from urllib.parse import urlsplit, urljoin

try:
    unicode = unicode
except NameError:
    unicode = str


def to_unicode(value):
    if isinstance(value, bytes):
        return value.decode('utf-8')
    return value


def to_bytes(value):
    if isinstance(value, unicode):
        return value.encode('utf-8')
    return value
