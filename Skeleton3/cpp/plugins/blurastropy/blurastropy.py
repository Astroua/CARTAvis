#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import print_function

print("hello from blurastropy.py")

from scipy import ndimage
import scipy
import numpy as np
from random import randrange
from astropy.convolution import convolve_fft, Gaussian2DKernel

def no_preRenderHook(w, h, data):
    print("preRenderHook from blurastropy.py", w, h, len(data))
    # Hardwired 15 pixel stddev for Gaussian kernel
    kernel = Gaussian2DKernel(15)
    
    for plane in range(data.shape[-1]):
        data[:,:,plane] = convolve_fft(plane, kernel, normalize_kernel = True, 
                                       boundary='extend', interpolate_nan=True)

print("end of blurastropy.py")
