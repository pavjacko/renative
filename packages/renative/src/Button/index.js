/* eslint-disable react/prop-types */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { getScaledValue } from '../Api';
import Icon from '../Icon';

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        opacity: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        marginRight: getScaledValue(20)
    }
});

const Button = ({
    title,
    iconFont,
    iconName,
    iconColor,
    iconSize,
    style,
    textStyle,
    testID,
    onPress,
    activeOpacity,
    ...touchableProps
}) => (
    <TouchableOpacity
        style={[styles.button, style]}
        onPress={onPress}
        activeOpacity={activeOpacity ?? 0.2}
        testID={testID}
        {...touchableProps}
    >
        {iconName ? (
            <Icon
                iconFont={iconFont}
                iconName={iconName}
                iconColor={iconColor}
                size={iconSize}
                style={[
                    styles.icon,
                    {
                        width: iconSize,
                        height: iconSize,
                        marginRight: title ? getScaledValue(20) : 0
                    }
                ]}
            />
        ) : null}
        {title ? (
            <Text style={textStyle}>
                {title}
            </Text>
        ) : null}
    </TouchableOpacity>
);

export default Button;
