#!/usr/bin/env python
# -*- coding: utf-8 -*-

from cartaview import CartaView

class Histogram(CartaView):
    """Represents a histogram view"""

    def applyClips(self, clipMin, clipMax, mode):
        result = self.con.cmdTagList("applyClips",
                                     histogramView=self.getId(),
                                     clipMinValue=clipMin,
                                     clipMaxValue=clipMax, modeStr=mode)
        return result

    def applyClipsByPercent(self, clipMin, clipMax):
        """ Convenience function. """
        result = self.applyClips(clipMin, clipMax, "percent")
        return result

    def applyClipsByIntensity(self, clipMin, clipMax):
        """ Convenience function. """
        result = self.applyClips(clipMin, clipMax, "intensity")
        return result

    def setBinCount(self, count):
        result = self.con.cmdTagList("setBinCount",
                                     histogramView=self.getId(),
                                     binCount=count)
        return result

    def setBinWidth(self, width):
        result = self.con.cmdTagList("setBinWidth",
                                     histogramView=self.getId(),
                                     binWidth=width)
        return result

    def setPlaneMode(self, mode):
        result = self.con.cmdTagList("setPlaneMode",
                                     histogramView=self.getId(),
                                     planeMode=mode)
        return result

    def setPlaneRange(self, minPlane, maxPlane):
        result = self.con.cmdTagList("setPlaneRange",
                                     histogramView=self.getId(),
                                     minPlane=minPlane,
                                     maxPlane=maxPlane)
        return result

    def setChannelUnit(self, unit):
        result = self.con.cmdTagList("setChannelUnit",
                                     histogramView=self.getId(),
                                     unit=unit)
        return result

    def setGraphStyle(self, style):
        result = self.con.cmdTagList("setGraphStyle",
                                     histogramView=self.getId(),
                                     graphStyle=style)
        return result

    def setLogCount(self, logCount='toggle'):
        result = self.con.cmdTagList("setLogCount",
                                     histogramView=self.getId(),
                                     logCount=str(logCount))
        return result

    def setColored(self, colored='toggle'):
        result = self.con.cmdTagList("setColored",
                                     histogramView=self.getId(),
                                     colored=str(colored))
        return result
